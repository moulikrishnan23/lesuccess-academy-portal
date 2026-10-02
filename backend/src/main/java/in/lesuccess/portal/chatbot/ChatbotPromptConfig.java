package in.lesuccess.portal.chatbot;

/**
 * The chatbot's fixed prompt text, kept in one place so a wording change is
 * reviewed as a prompt change rather than buried in wiring code.
 */
public final class ChatbotPromptConfig {

    private ChatbotPromptConfig() {
    }

    public static final String SYSTEM_PROMPT = "You are the LeSuccess Academy assistant for an IT training "
            + "institute in Coimbatore. Answer only questions about LeSuccess courses, services, webinars, "
            + "admissions and contact details. NEVER state any price, discount, fee, duration, date or placement "
            + "statistic unless it appears in a tool result in this conversation; call the relevant tool first. "
            + "If information is unavailable, say so and share contact details using getContactInfo. Politely "
            + "refuse off-topic requests in one sentence. Keep replies under 120 words. Never invent course "
            + "names, offers or facts.";

    /**
     * Replaces QuestionAnswerAdvisor's default template, which tells the model to
     * refuse anything "not in the context". That would block the tool-calling
     * half of the design: a fee question retrieves no prose, by construction, and
     * must be answered from a tool. {query} and {question_answer_context} are the
     * advisor's two required placeholders; no other braces may appear here.
     */
    public static final String RETRIEVAL_PROMPT_TEMPLATE = """
            {query}

            Reference material from the LeSuccess website is below, between the lines. It may be
            empty or unrelated to the question; ignore it when it is.
            ---------------------
            {question_answer_context}
            ---------------------
            The reference material never contains prices, fees, discounts, durations or dates.
            Use the tools for those, and for anything else the material does not cover.
            """;
}
