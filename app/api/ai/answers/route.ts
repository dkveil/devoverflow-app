import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { handleError } from '@/lib/handlers/error';
import { ValidationError } from '@/lib/http-errors';
import { AIAnswerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const { question, content, userAnswer } = await request.json();

  try {
    const validationResult = AIAnswerSchema.safeParse({ question, content, userAnswer });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.flatten().fieldErrors);
    }

    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `You are tasked with generating a comprehensive answer to the following question:

**QUESTION:** "${question}"

**CONTEXT:** ${content}

**USER'S CURRENT ANSWER:** ${userAnswer || 'No user answer provided'}

**INSTRUCTIONS:**
1. Analyze the user's answer (if provided) for accuracy, completeness, and clarity
2. If the user's answer is correct and complete, enhance it with additional details, examples, or better formatting
3. If the user's answer is partially correct, build upon it while correcting any errors
4. If the user's answer is incorrect or empty, provide a comprehensive answer from scratch
5. Always maintain the user's original intent and style when possible

**RESPONSE REQUIREMENTS:**
- Provide a clear, well-structured answer in markdown format
- Include relevant code examples when applicable
- Use appropriate headings, bullet points, and formatting
- Be concise but comprehensive
- Ensure technical accuracy
- Add practical examples or use cases when relevant

**FORMATTING GUIDELINES:**
- Use proper markdown syntax
- For code blocks, use lowercase language identifiers (js, ts, py, html, css, etc.)
- Structure the response with clear sections if the answer is complex
- Include bullet points or numbered lists for step-by-step instructions
- Bold important concepts or keywords

Generate your response now:`,
      system: `You are an expert technical assistant with deep knowledge across multiple programming languages and technologies.

Your responses should be:
- Technically accurate and up-to-date
- Well-structured and easy to follow
- Practical with real-world examples
- Professional but accessible
- Formatted in clean markdown

When working with user-provided answers:
- Respect the user's effort and build upon their work
- Gently correct errors without being condescending
- Enhance incomplete answers with additional context
- Maintain consistency with the user's coding style and approach

Always prioritize clarity, accuracy, and usefulness in your responses.`,
    });

    return new Response(JSON.stringify({ success: true, data: { answer: text } }), { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
