### Coverage Summary

{{#hasBaseline}}
```diff
- 📊 Overall Coverage: {{baseline.lines}}% (baseline)
+ 📊 Overall Coverage: {{current.lines}}% {{diffArrow}} (current PR)
```

{{/hasBaseline}}
{{#status.hasChange}}
{{status.emoji}} **{{status.text}}**
{{#hasBaseline}}
📈 Overall Coverage: {{current.lines}}% {{status.arrow}}
{{status.changeEmoji}} {{status.changeText}} from baseline
{{/hasBaseline}}
{{/status.hasChange}}
{{^status.hasChange}}
{{#hasBaseline}}
{{status.emoji}} **{{status.text}}**
📊 Overall Coverage: {{current.lines}}% (unchanged)
{{/hasBaseline}}
{{^hasBaseline}}
📊 **Overall Coverage**: {{current.lines}}%
{{/hasBaseline}}
{{/status.hasChange}}

{{#links.coverageReport}}
📄 [View Full Coverage Report]({{links.coverageReport}})
{{/links.coverageReport}}
🔗 [View Workflow Run Summary]({{links.workflowRun}})

<!-- END_COVERAGE_SECTION -->
