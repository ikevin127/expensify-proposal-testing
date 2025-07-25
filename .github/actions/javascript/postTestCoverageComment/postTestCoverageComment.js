import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import fs from 'fs';
import path from 'path';

const COVERAGE_SECTION_START = '<!-- START_COVERAGE_SECTION -->';
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
        branches: coverage.total.branches?.pct,
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
            branches: baseCoverage.total.branches,
        };
    }

    return result;
}

/**
 * Simple mustache-like template engine
 */
function renderTemplate(template, data) {
    let result = template;
    
    // Handle array iterations FIRST (before conditional blocks to avoid conflicts)
    result = result.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, arrayName, content) => {
        const array = getNestedValue(data, arrayName);
        if (Array.isArray(array)) {
            return array.map(item => renderTemplate(content, {...data, ...item})).join('');
        }
        // If not an array, treat as conditional block
        const value = getNestedValue(data, arrayName);
        return value ? renderTemplate(content, data) : '';
    });
    
    // Handle inverted conditional blocks {{^condition}} ... {{/condition}}
    result = result.replace(/\{\{\^([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, condition, content) => {
        const value = getNestedValue(data, condition);
        return !value ? renderTemplate(content, data) : '';
    });
    
    // Handle variable substitutions {{variable}}
    result = result.replace(/\{\{([^}#^/]+)\}\}/g, (match, variable) => {
        const value = getNestedValue(data, variable.trim());
        return value !== undefined ? value : '';
    });
    
    return result;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * Generate enhanced coverage section markdown with better formatting
 */
function generateCoverageSection(coverageData, artifactUrl, workflowRunId) {
    const {overall, changedFiles, baseCoverage} = coverageData;
    
    // Local template for easy editing
    const coverageTemplate = `### 🧪 Test Coverage Report

{{#hasBaseline}}
{{#status.hasChange}}
\`\`\`diff
{{#status.isIncrease}}+ 📊 Overall Coverage: {{current.lines}}% ↑ (baseline: {{baseline.lines}}%){{/status.isIncrease}}{{#status.isDecrease}}- 📊 Overall Coverage: {{current.lines}}% ↓ (baseline: {{baseline.lines}}%){{/status.isDecrease}}
\`\`\`
{{/status.hasChange}}
{{/hasBaseline}}

{{#status.hasChange}}
{{status.emoji}} **{{status.text}}**
{{#hasBaseline}}
{{#status.isIncrease}}📈{{/status.isIncrease}}{{#status.isDecrease}}📉{{/status.isDecrease}} Overall Coverage: {{current.lines}}% {{status.arrow}}
{{status.changeEmoji}} {{status.changeText}} from baseline
{{/hasBaseline}}
{{/status.hasChange}}
{{^status.hasChange}}
{{#hasBaseline}}
📊 Overall Coverage: {{current.lines}}% (unchanged)
{{/hasBaseline}}
{{^hasBaseline}}
📊 **Overall Coverage**: {{current.lines}}%
{{/hasBaseline}}
{{/status.hasChange}}

<details>
<summary>📋 Coverage Details</summary>

{{#hasChangedFiles}}
| File | Coverage | Lines |
|------|----------|-------|
{{#changedFiles}}| \`{{displayFile}}\` | {{coverage}}% | {{lines}} |
{{/changedFiles}}
{{/hasChangedFiles}}
{{^hasChangedFiles}}
*No changed files with coverage data were found.*
{{/hasChangedFiles}}
### Overall Coverage Summary
{{#hasBaseline}}
- **Lines**: {{current.lines}}% ({{changes.lines.emoji}} {{changes.lines.text}})
- **Statements**: {{current.statements}}% ({{changes.statements.emoji}} {{changes.statements.text}})
- **Functions**: {{current.functions}}% ({{changes.functions.emoji}} {{changes.functions.text}})
{{/hasBaseline}}
{{^hasBaseline}}
- **Lines**: {{current.lines}}%
- **Statements**: {{current.statements}}%
- **Functions**: {{current.functions}}%
{{/hasBaseline}}

</details>

📄 [View Full Coverage Report]({{links.coverageReport}})
🔗 [View Workflow Run Summary]({{links.workflowRun}})

<!-- END_COVERAGE_SECTION -->`;
    
    // Get coverage status for overall lines coverage
    const coverageStatus = getCoverageStatus(overall.lines, baseCoverage?.lines);
    
    // Calculate changes for all metrics
    const changes = baseCoverage ? {
        lines: calculateChange(overall.lines, baseCoverage.lines),
        statements: calculateChange(overall.statements, baseCoverage.statements),
        functions: calculateChange(overall.functions, baseCoverage.functions),
    } : {};
    
    // Process changed files for template
    const processedChangedFiles = changedFiles.map(file => ({
        ...file,
        displayFile: file.file.length > 50 ? `...${file.file.slice(-47)}` : file.file,
        coverage: file.coverage != null ? file.coverage.toFixed(1) : '0.0',
    }));
    
    const avgChangedCoverage = changedFiles.length > 0 
        ? (changedFiles.reduce((sum, file) => sum + file.coverage, 0) / changedFiles.length).toFixed(1)
        : 0;
    
    // Prepare template data
    const templateData = {
        hasBaseline: !!baseCoverage,
        hasChangedFiles: changedFiles.length > 0,
        avgChangedCoverage,
        
        current: {
            lines: overall.lines?.toFixed(1),
            functions: overall.functions?.toFixed(1),
            statements: overall.statements?.toFixed(1),
        },
        
        baseline: baseCoverage ? {
            lines: baseCoverage.lines?.toFixed(2),
            functions: baseCoverage.functions?.toFixed(2),
            statements: baseCoverage.statements?.toFixed(2),
        } : null,
        
        status: {
            emoji: coverageStatus.emoji,
            text: coverageStatus.status,
            hasChange: coverageStatus.diff !== 0,
            isIncrease: coverageStatus.diff > 0,
            isDecrease: coverageStatus.diff < 0,
            arrow: coverageStatus.diff > 0 ? '↑' : '↓',
            changeEmoji: coverageStatus.diff > 0 ? '🚀' : '⚠️',
            changeText: `${Math.abs(coverageStatus.diff)?.toFixed(1)}% ${coverageStatus.diff > 0 ? 'gain' : 'drop'}`
        },
        
        changes,
        changedFiles: processedChangedFiles,
        
        links: {
            coverageReport: artifactUrl,
            workflowRun: `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId}`
        }
    };
    
    return renderTemplate(coverageTemplate, templateData);
}

/**
 * Calculate coverage change with formatting
 */
function calculateChange(current, baseline) {
    const diff = current - baseline;
    if (Math.abs(diff) < 0.01) {
        return {
            text: '→ 0.0%',
            emoji: '→'
        };
    }
    const arrow = diff > 0 ? '↑' : '↓';
    const emoji = diff > 0 ? '📈' : '📉';
    return {
        text: `${diff > 0 ? '+' : ''}${diff?.toFixed(2)}%`,
        emoji: `${emoji} ${arrow} ${Math.abs(diff)?.toFixed(1)}%`
    };
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
            const separator = currentBody.trim() ? '\n\n##\n\n' : '';
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
function getCoverageUrl(coverageUrl, workflowRunId) {
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
        const reportUrl = getCoverageUrl(coverageUrl, workflowRunId);

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
