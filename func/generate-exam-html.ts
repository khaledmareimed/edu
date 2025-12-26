export function generateExamHTML(
    title: string,
    mcqs: any[],
    fillBlanks: any[],
    solutions: any[]
): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Exam</title>
    <style>
        @page {
            size: A4;
            margin: 2cm 1.5cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 21cm;
            margin: 0 auto;
            padding: 2cm 1.5cm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 1.5cm;
            border-bottom: 2px solid #000;
            padding-bottom: 0.5cm;
        }
        
        .header h1 {
            font-size: 20pt;
            margin-bottom: 0.3cm;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .header .meta {
            font-size: 11pt;
            color: #333;
        }
        
        .instructions {
            background: #f5f5f5;
            padding: 0.5cm;
            margin-bottom: 1cm;
            border-left: 3px solid #333;
        }
        
        .instructions h3 {
            font-size: 12pt;
            margin-bottom: 0.2cm;
        }
        
        .instructions ul {
            margin-left: 1cm;
            font-size: 11pt;
        }
        
        .section {
            margin-bottom: 1.5cm;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 0.5cm;
            padding: 0.2cm 0.3cm;
            background: #333;
            color: #fff;
            text-transform: uppercase;
        }
        
        .question {
            margin-bottom: 1cm;
            page-break-inside: avoid;
        }
        
        .question-number {
            font-weight: bold;
            margin-bottom: 0.2cm;
        }
        
        .question-text {
            margin-bottom: 0.3cm;
            line-height: 1.7;
        }
        
        .options {
            margin-left: 0.5cm;
        }
        
        .option {
            margin-bottom: 0.2cm;
            display: flex;
            align-items: center;
        }
        
        .option-circle {
            width: 12px;
            height: 12px;
            border: 1.5px solid #000;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.3cm;
            flex-shrink: 0;
        }
        
        .option-text {
            flex: 1;
        }
        
        .blank-line {
            display: inline-block;
            border-bottom: 1px solid #000;
            min-width: 3cm;
            margin: 0 0.1cm;
        }
        
        .work-space {
            min-height: 3cm;
            border: 1px dashed #999;
            margin-top: 0.3cm;
            padding: 0.3cm;
            page-break-inside: avoid;
        }
        
        .answer-key {
            page-break-before: always;
            margin-top: 2cm;
        }
        
        .answer-key-title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1cm;
            text-transform: uppercase;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.3cm 0;
        }
        
        .answer-section {
            margin-bottom: 1cm;
        }
        
        .answer-section h3 {
            font-size: 13pt;
            margin-bottom: 0.3cm;
            background: #f0f0f0;
            padding: 0.2cm 0.3cm;
        }
        
        .answer-list {
            column-count: 2;
            column-gap: 1cm;
        }
        
        .answer-item {
            margin-bottom: 0.2cm;
            page-break-inside: avoid;
        }
        
        .answer-number {
            font-weight: bold;
        }
        
        .difficulty-badge {
            display: inline-block;
            padding: 0.05cm 0.2cm;
            font-size: 9pt;
            border-radius: 2px;
            margin-left: 0.2cm;
            background: #e0e0e0;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="meta">
            <p>Date: ${currentDate}</p>
        </div>
    </div>
    
    <div class="instructions">
        <h3>Instructions</h3>
        <ul>
            <li>Read each question carefully before answering.</li>
            <li>For multiple choice questions, mark your answer by filling in the circle.</li>
            <li>For fill-in-the-blank questions, write your answer clearly on the line provided.</li>
            <li>For problem solutions, show all your work in the space provided.</li>
            <li>The answer key can be found at the end of this document.</li>
        </ul>
    </div>

    ${mcqs.length > 0 ? `
    <div class="section">
        <div class="section-title">Part I: Multiple Choice Questions</div>
        ${mcqs.map((q, i) => `
        <div class="question">
            <div class="question-number">Question ${i + 1} <span class="difficulty-badge">${q.difficulty || 'medium'}</span></div>
            <div class="question-text">${q.question}</div>
            <div class="options">
                ${q.options?.map((opt: string, optIdx: number) => `
                <div class="option">
                    <span class="option-circle"></span>
                    <span class="option-text">${String.fromCharCode(65 + optIdx)}. ${opt}</span>
                </div>
                `).join('') || ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${fillBlanks.length > 0 ? `
    <div class="section">
        <div class="section-title">Part II: Fill in the Blanks</div>
        ${fillBlanks.map((q, i) => `
        <div class="question">
            <div class="question-number">Question ${i + 1} <span class="difficulty-badge">${q.difficulty || 'medium'}</span></div>
            <div class="question-text">${q.question.replace(/_____/g, '<span class="blank-line"></span>')}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${solutions.length > 0 ? `
    <div class="section">
        <div class="section-title">Part III: Problem Solutions</div>
        ${solutions.map((q, i) => `
        <div class="question">
            <div class="question-number">Question ${i + 1} <span class="difficulty-badge">${q.difficulty || 'hard'}</span></div>
            <div class="question-text">${q.problem}</div>
            <div class="work-space">
                <em style="font-size: 10pt; color: #666;">Show your work here:</em>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="answer-key">
        <div class="answer-key-title">Answer Key</div>
        
        ${mcqs.length > 0 ? `
        <div class="answer-section">
            <h3>Multiple Choice Answers</h3>
            <div class="answer-list">
                ${mcqs.map((q, i) => `
                <div class="answer-item">
                    <span class="answer-number">${i + 1}.</span> ${String.fromCharCode(65 + (q.correctAnswer || 0))}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${fillBlanks.length > 0 ? `
        <div class="answer-section">
            <h3>Fill in the Blank Answers</h3>
            ${fillBlanks.map((q, i) => `
            <div class="answer-item">
                <span class="answer-number">${i + 1}.</span> ${q.answer}
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${solutions.length > 0 ? `
        <div class="answer-section">
            <h3>Problem Solution Answers</h3>
            ${solutions.map((q, i) => `
            <div class="answer-item" style="margin-bottom: 0.5cm;">
                <div><span class="answer-number">${i + 1}.</span> <strong>Answer:</strong> ${q.solution}</div>
                ${q.steps?.length > 0 ? `
                <div style="margin-left: 0.5cm; margin-top: 0.2cm;">
                    <strong>Steps:</strong>
                    <ol style="margin-left: 0.5cm;">
                        ${q.steps.map((step: string) => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                ` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `.trim()
}

