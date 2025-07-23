import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import fs from 'fs';
import path from 'path';

const COVERAGE_SECTION_START = '<-- START_COVERAGE_SECTION -->';
const COVERAGE_SECTION_END = '<!-- END_COVERAGE_SECTION -->';

/**
 * Get list of changed files in the PR
 */
async function getChangedFiles(octokit, prNumber) {
    try {
        const response = await octokit.rest.pulls.listFiles({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
            per_page: 100,
        });

        return response.data
            .filter((file) => file.filename.match(/\.(ts|tsx|js|jsx)$/))
            .map((file) => file.filename);
    } catch (error) {
        console.error('Error getting changed files:', error);
        return [];
    }
}

/**
 * Parse Jest coverage summary
 */
function parseCoverageSummary(coveragePath) {
    try {
        const summaryPath = path.join(coveragePath, 'coverage-summary.json');
        if (!fs.existsSync(summaryPath)) {
            console.log(`Coverage summary not found at ${summaryPath}`);
            return null;
        }

        const data = fs.readFileSync(summaryPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing coverage summary:', error);
        return null;
    }
}

/**
 * Generate coverage data for changed files
 */
function generateCoverageData(coverage, changedFiles, baseCoverage) {
    const overall = {
        statements: coverage.total.statements.pct,
        functions: coverage.total.functions.pct,
        lines: coverage.total.lines.pct,
    };

    const changedFilesData = changedFiles
        .map((file) => {
            // Try to find coverage data for this file - first try exact match
            let fileCoverage = coverage[file];
            // If not found, try to find by matching the end of the path
            if (!fileCoverage) {
                const coverageKeys = Object.keys(coverage).filter((key) => key !== 'total');
                const matchingKey = coverageKeys.find((key) => key.endsWith(file) || key.endsWith(file.replace(/^src\//, '')));
                if (matchingKey) {
                    fileCoverage = coverage[matchingKey];
                }
            }
            return fileCoverage
                ? {
                      file,
                      coverage: fileCoverage.lines.pct,
                      lines: `${fileCoverage.lines.covered}/${fileCoverage.lines.total}`,
                  }
                : null;
        })
        .filter((item) => item !== null)
        .sort((a, b) => b.coverage - a.coverage);

    const result = {
        overall,
        changedFiles: changedFilesData,
    };

    if (baseCoverage) {
        result.baseCoverage = {
            statements: baseCoverage.total.statements.pct,
            functions: baseCoverage.total.functions.pct,
            lines: baseCoverage.total.lines.pct,
        };
    }

    return result;
}

/**
 * Generate enhanced coverage section markdown using template
 */
function generateCoverageSection(coverageData, artifactUrl, workflowRunId) {
    const {overall, changedFiles, baseCoverage} = coverageData;

    const coverageStatus = getCoverageStatus(overall.lines, baseCoverage?.lines);
    let coverageSection = '';

    if (baseCoverage) {
        if (coverageStatus.diff !== 0) {
            const diffPrefix = coverageStatus.diff > 0 ? '+' : '-';
            coverageSection += '```diff\n';
            coverageSection += `${diffPrefix} 📊 Overall Coverage: ${overall.lines.toFixed(2)}% ${coverageStatus.diff > 0 ? '↑' : '↓'} (baseline: ${baseCoverage.lines.toFixed(2)}%)\n`;
            coverageSection += '```\n\n';
        }

        coverageSection += `${coverageStatus.emoji} **${coverageStatus.status}**\n`;
        if (coverageStatus.diff !== 0) {
            const arrow = coverageStatus.diff > 0 ? '↑' : '↓';
            const gain = coverageStatus.diff > 0 ? 'gain' : 'drop';
            coverageSection += `📈 Overall Coverage: ${overall.lines.toFixed(1)}% ${arrow}\n`;
            coverageSection += `${coverageStatus.diff > 0 ? '🚀' : '⚠️'} ${Math.abs(coverageStatus.diff).toFixed(1)}% ${gain} from baseline\n`;
        } else {
            coverageSection += `📊 Overall Coverage: ${overall.lines.toFixed(1)}% (unchanged)\n`;
        }
    } else {
        coverageSection += `📊 **Overall Coverage**: ${overall.lines.toFixed(1)}%\n`;
    }

    coverageSection += '\n<details>\n<summary>📋 Coverage Details</summary>\n\n';

    if (changedFiles.length > 0) {
        coverageSection += '| File | Coverage | Lines |\n';
        coverageSection += '|------|----------|-------|\n';

        changedFiles.forEach((file) => {
            const displayFile = file.file.length > 50 ? `...${file.file.slice(-47)}` : file.file;
            coverageSection += `| ${displayFile} | ${file.coverage.toFixed(1)}% | ${file.lines} |\n`;
        });
        coverageSection += '\n';
    } else {
        coverageSection += '*No changed files with coverage data found.*\n\n';
    }

    coverageSection += '### Overall Coverage Summary\n';

    const formatMetric = (name, current, base) => {
        if (!base) {
            return `- **${name}**: ${current.toFixed(2)}%`;
        }
        const diff = current - base;
        if (Math.abs(diff) < 0.01) {
            return `- **${name}**: ${current.toFixed(2)}%`;
        }
        const sign = diff > 0 ? '+' : '';
        const emoji = diff > 0 ? '📈' : '📉';
        return `- **${name}**: ${current.toFixed(2)}% (${emoji} ${sign}${diff.toFixed(2)}%)`;
    };

    coverageSection += `${formatMetric('Lines', overall.lines, baseCoverage?.lines)}\n`;
    coverageSection += `${formatMetric('Statements', overall.statements, baseCoverage?.statements)}\n`;
    coverageSection += `${formatMetric('Functions', overall.functions, baseCoverage?.functions)}\n`;

    coverageSection += '\n</details>\n\n';
    coverageSection += `📄 [View Full Coverage Report](${artifactUrl})\n`;
    coverageSection += `🔗 [View Workflow Run Summary](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId})\n`;
    coverageSection += `\n${COVERAGE_SECTION_END}`;

    return coverageSection;
}

/**
 * Generate coverage status emoji and text based on comparison with baseline
 */
function getCoverageStatus(current, base) {
    if (!base) {
        return {emoji: '📊', status: 'Overall Coverage', diff: 0};
    }
    const diff = current - base;
    if (Math.abs(diff) < 0.01) {
        return {emoji: '📊', status: 'Overall Coverage', diff: 0};
    }
    if (diff > 0) {
        return {emoji: '🟢', status: 'Coverage up!', diff};
    }
    return {emoji: '🔴', status: 'Coverage dropped!', diff};
}

/**
 * Update PR body with coverage information
 */
async function updatePRBody(octokit, prNumber, coverageSection) {
    try {
        // Get current PR data
        const prResponse = await octokit.rest.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
        });

        const currentBody = prResponse.data.body || '';

        // Check if coverage section already exists
        const coverageStartIndex = currentBody.indexOf(COVERAGE_SECTION_START);
        const coverageEndIndex = currentBody.indexOf(COVERAGE_SECTION_END);

        let newBody;
        if (coverageStartIndex !== -1 && coverageEndIndex !== -1) {
            // Replace existing coverage section
            const beforeCoverage = currentBody.substring(0, coverageStartIndex);
            const afterCoverage = currentBody.substring(coverageEndIndex + COVERAGE_SECTION_END.length);
            newBody = `${beforeCoverage}${COVERAGE_SECTION_START}\n${coverageSection}${afterCoverage}`;
        } else {
            // Add coverage section at the end
            const separator = currentBody.trim() ? '\n\n---\n\n' : '';
            newBody = `${currentBody + separator}\n${COVERAGE_SECTION_START}\n${coverageSection}`;
        }

        // Update PR body
        await octokit.rest.pulls.update({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
            body: newBody,
        });

        console.log(`Successfully updated PR #${prNumber} body with coverage information`);
    } catch (error) {
        console.error('Error updating PR body:', error);
        throw error;
    }
}

/**
 * Get coverage report URL - either from direct input or fallback to workflow artifacts
 */
function getCoverageUrl(coverageUrl, artifactName, workflowRunId) {
    // If we have a direct URL (e.g., from Surge.sh), use it
    if (coverageUrl) {
        return coverageUrl;
    }

    // Fallback to workflow run artifacts page
    return `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId}`;
}

/**
 * Main function
 */
async function run() {
    try {
        const githubToken = core.getInput('GITHUB_TOKEN', {required: true});
        const octokit = getOctokit(githubToken);

        const prNumber = parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
        const coverageArtifactName = core.getInput('COVERAGE_ARTIFACT_NAME', {required: false}) || 'coverage-report';
        const baseCoveragePath = core.getInput('BASE_COVERAGE_PATH', {required: false});
        const coverageUrl = core.getInput('COVERAGE_URL', {required: false});
        const customTemplatePath = core.getInput('TEMPLATE_PATH', {required: false});

        console.log(`Processing test coverage for PR #${prNumber}`);

        // Get changed files
        const changedFiles = await getChangedFiles(octokit, prNumber);
        console.log(`Found ${changedFiles.length} changed files`);

        // Parse coverage data
        const coveragePath = './coverage';
        const coverage = parseCoverageSummary(coveragePath);

        if (!coverage) {
            console.log('No coverage data found, skipping coverage update');
            return;
        }

        // Parse base coverage if provided
        let baseCoverage;
        if (baseCoveragePath && fs.existsSync(baseCoveragePath)) {
            baseCoverage = parseCoverageSummary(baseCoveragePath);
        }

        // Generate coverage data
        const coverageData = generateCoverageData(coverage, changedFiles, baseCoverage);

        // Get coverage URL
        const workflowRunId = context.runId.toString();
        const reportUrl = getCoverageUrl(coverageUrl, coverageArtifactName, workflowRunId);

        // Generate coverage section
        const coverageSection = generateCoverageSection(coverageData, reportUrl, workflowRunId, customTemplatePath);

        // Update PR body with coverage information
        await updatePRBody(octokit, prNumber, coverageSection);

        // Add coverage information to GitHub Job Summary (displays on workflow run page)
        await core.summary
            .addHeading(`📊 Test Coverage Report for PR #${prNumber}`, 2)
            .addRaw(coverageSection)
            .addSeparator()
            .addRaw('💡 This summary is also available in the PR description.')
            .write();

        // Set outputs
        core.setOutput('coverage-summary', JSON.stringify(coverageData.overall));
        core.setOutput('coverage-changed', changedFiles.length > 0);

        console.log('Test coverage information added to PR body and workflow summary successfully');
    } catch (error) {
        console.error('Error in postTestCoverageComment:', error);
        core.setFailed(error.message);
    }
}

// Run the action
run();

export default run;
