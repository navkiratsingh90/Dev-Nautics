
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Question from "@/models/question-model";
import User from "@/models/user-model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Database connection
    await connectDb();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 3. Request data
    const { questionId, mode, selectedOption } = await req.json();

    if (!questionId || !["hint", "review"].includes(mode)) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    // 4. Fetch question from MongoDB
    const question: any = await Question.findById(questionId).lean();

    if (!question || !question.isActive) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    if (
      !Array.isArray(question.options) ||
      question.options.length < 2
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid question data" },
        { status: 400 }
      );
    }

    // 5. Check whether the user has submitted an answer
    let userAnswer = "Not attempted";

    if (mode === "review") {
      if (
        !["A", "B", "C", "D"].includes(selectedOption)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid selected option" },
          { status: 400 }
        );
      }

      const Submission = (await import("@/models/submission-model")).default;

      const submission = await Submission.findOne({
        user: user._id,
        question: questionId,
      });

      if (!submission) {
        return NextResponse.json(
          {
            success: false,
            message: "Submit your answer before requesting a review",
          },
          { status: 403 }
        );
      }

      userAnswer = submission.selectedOption;
    }

    // 6. Prepare AI prompt
    const options = question.options
      .map((option: string, index: number) => {
        return `${String.fromCharCode(65 + index)}. ${option}`;
      })
      .join("\n");

    const prompt =
      mode === "hint"
        ? `
You are an expert technical interview mentor.

Help a student solve the following question.

Category: ${question.category}
Difficulty: ${question.difficulty || "Not specified"}

Question:
${question.question}

Options:
${options}

Rules:
1. DO NOT reveal the correct option.
2. Give a useful conceptual hint.
3. Explain which concept the student should think about.
4. Suggest a logical approach.
5. Mention one common mistake.
6. Generate one similar practice question.
7. Keep explanations beginner-friendly.

Return ONLY valid JSON in this format:

{
  "hint": "A useful hint",
  "concept": "Concept being tested",
  "approach": "Steps to approach the question",
  "commonMistake": "A common mistake",
  "relatedQuestion": "A similar practice question"
}
`
        : `
You are an expert technical interview mentor.

Analyze the student's submitted answer.

Category: ${question.category}

Question:
${question.question}

Options:
${options}

Student selected: ${userAnswer}
Correct option: ${question.correctOption}

Database explanation:
${question.explanation || "No explanation available"}

Explain:
1. Why the correct option is correct.
2. Why the student's selected option is correct or incorrect.
3. The underlying concept.
4. How to solve similar questions.

Return ONLY valid JSON:

{
  "hint": "Answer analysis",
  "concept": "Concept explanation",
  "approach": "Step-by-step solution",
  "commonMistake": "Mistake to avoid",
  "relatedQuestion": "A similar practice question"
}
`;

    // 7. Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-3.6-flash";

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is missing" },
        { status: 500 }
      );
    }

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();

      console.error("Gemini API error:", errorData);

      return NextResponse.json(
        {
          success: false,
          message: "AI service failed. Please try again.",
        },
        { status: 502 }
      );
    }

    // 8. Extract AI response
    const result = await aiResponse.json();

    const generatedText =
      result.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("")
        .trim();

    if (!generatedText) {
      return NextResponse.json(
        { success: false, message: "AI returned an empty response" },
        { status: 502 }
      );
    }

    const suggestions = JSON.parse(generatedText);

    // 9. Return response
    return NextResponse.json({
      success: true,
      data: suggestions,
    });

  } catch (error: any) {
    console.error("AI SUGGESTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.name === "TimeoutError"
            ? "AI request timed out"
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
