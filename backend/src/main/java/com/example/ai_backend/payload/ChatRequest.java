package com.example.ai_backend.payload;

import java.util.List;

public class ChatRequest {
    private String inputText;
    private List<ChatMessage> conversationHistory;

    public ChatRequest() {
    }

    public ChatRequest(String inputText, List<ChatMessage> conversationHistory) {
        this.inputText = inputText;
        this.conversationHistory = conversationHistory;
    }

    public String getInputText() {
        return inputText;
    }

    public void setInputText(String inputText) {
        this.inputText = inputText;
    }

    public List<ChatMessage> getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(List<ChatMessage> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}