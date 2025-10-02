import { NextRequest, NextResponse } from 'next/server';

interface SessionData {
  sessionId: string;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  problemStatement?: string;
  codeAttempts?: string[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  userResponses?: string[];
}

interface RubricScore {
  dimension: string;
  score: number; // 1-5 scale
  feedback: string;
}

interface ReportData {
  session: SessionData;
  rubric: RubricScore[];
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const sessionData: SessionData = await request.json();

    // Generate rubric scores (mock implementation for MVP)
    const rubricDimensions = [
      "Problem understanding",
      "Approach quality", 
      "Time/space complexity",
      "Edge case handling",
      "Code quality",
      "Communication skills"
    ];

    const rubric: RubricScore[] = rubricDimensions.map(dimension => ({
      dimension,
      score: Math.floor(Math.random() * 3) + 3, // Random score 3-5 for demo
      feedback: generateDimensionFeedback(dimension)
    }));

    // Calculate overall score
    const overallScore = rubric.reduce((sum, item) => sum + item.score, 0) / rubric.length;

    // Generate report data
    const reportData: ReportData = {
      session: sessionData,
      rubric,
      overallScore: Math.round(overallScore * 10) / 10,
      strengths: generateStrengths(rubric),
      improvements: generateImprovements(rubric),
      recommendations: generateRecommendations(rubric)
    };

    // Generate Markdown report
    const markdownReport = generateMarkdownReport(reportData);

    return new NextResponse(markdownReport, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="interview-feedback-${sessionData.sessionId}.md"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateDimensionFeedback(dimension: string): string {
  const feedbackTemplates = {
    "Problem understanding": [
      "Good grasp of the problem requirements",
      "Clear understanding of input/output expectations", 
      "Identified key constraints and edge cases"
    ],
    "Approach quality": [
      "Logical problem-solving approach",
      "Considered multiple solution strategies",
      "Good use of algorithmic thinking"
    ],
    "Time/space complexity": [
      "Able to analyze time complexity",
      "Considered space trade-offs",
      "Identified optimization opportunities"
    ],
    "Edge case handling": [
      "Thought about boundary conditions",
      "Considered empty inputs and null cases",
      "Good defensive programming mindset"
    ],
    "Code quality": [
      "Clean, readable code structure",
      "Good variable naming and organization",
      "Appropriate use of data structures"
    ],
    "Communication skills": [
      "Clear explanation of thought process",
      "Good at articulating trade-offs",
      "Engaged well with interviewer questions"
    ]
  };

  const templates = feedbackTemplates[dimension as keyof typeof feedbackTemplates] || ["Good performance in this area"];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateStrengths(rubric: RubricScore[]): string[] {
  const highScoringDimensions = rubric.filter(item => item.score >= 4);
  return highScoringDimensions.map(item => 
    `Strong ${item.dimension.toLowerCase()}: ${item.feedback}`
  );
}

function generateImprovements(rubric: RubricScore[]): string[] {
  const lowScoringDimensions = rubric.filter(item => item.score <= 3);
  return lowScoringDimensions.map(item => 
    `Focus on ${item.dimension.toLowerCase()}: ${item.feedback}`
  );
}

function generateRecommendations(rubric: RubricScore[]): string[] {
  const recommendations = [
    "Practice more coding problems in this domain",
    "Review common algorithmic patterns and data structures",
    "Work on explaining your thought process more clearly",
    "Practice identifying edge cases and handling them explicitly",
    "Study time and space complexity analysis techniques"
  ];
  
  // Return 2-3 random recommendations
  return recommendations
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2);
}

function generateMarkdownReport(data: ReportData): string {
  const { session, rubric, overallScore, strengths, improvements, recommendations } = data;
  
  return `# AI Interview Coach - Feedback Report

## Session Summary

- **Session ID**: ${session.sessionId}
- **Duration**: ${session.duration} minutes
- **Start Time**: ${session.startTime}
- **End Time**: ${session.endTime}
- **Overall Score**: ${overallScore}/5.0

## Rubric Assessment

${rubric.map(item => `
### ${item.dimension}: ${item.score}/5

${item.feedback}
`).join('\n')}

## Key Strengths

${strengths.map(strength => `- ${strength}`).join('\n')}

## Areas for Improvement

${improvements.map(improvement => `- ${improvement}`).join('\n')}

## Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. Review the areas marked for improvement
2. Practice similar problems focusing on weak areas
3. Work on explaining your thought process more clearly
4. Consider scheduling another practice session

---

*Generated by AI Interview Coach on ${new Date().toISOString()}*
*This report is based on your interview session and provides structured feedback for improvement.*
`;
}
