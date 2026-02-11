package com.example.ai_backend.service;

import com.example.ai_backend.payload.ChatMessage;
import com.example.ai_backend.payload.ChatRequest;
import com.example.ai_backend.payload.CricketResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.ai.model.ApiKey;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.OpenAiImageModel;
import org.springframework.ai.openai.OpenAiImageOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.OpenAiImageApi;
import org.springframework.core.io.ClassPathResource;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final String OPENAI_BASE_URL = "https://api.openai.com";
    
    private ChatModel createChatModel(String apiKey) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        
        OpenAiApi openAiApi = new OpenAiApi(
            OPENAI_BASE_URL,
            () -> apiKey,
            headers,
            "/v1/chat/completions",
            "/v1/embeddings",
            RestClient.builder(),
            WebClient.builder(),
            new DefaultResponseErrorHandler()
        );
        
        return new OpenAiChatModel(
            openAiApi,
            OpenAiChatOptions.builder()
                .model("gpt-4o-mini")
                .temperature(0.7)
                .build(),
            ToolCallingManager.builder().build(),
            RetryTemplate.builder().maxAttempts(3).build(),
            ObservationRegistry.NOOP
        );
    }

    private OpenAiImageModel createImageModel(String apiKey) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        
        OpenAiImageApi openAiImageApi = new OpenAiImageApi(
            OPENAI_BASE_URL,
            () -> apiKey,
            headers,
            "/v1/images/generations",
            RestClient.builder(),
            new DefaultResponseErrorHandler()
        );
        
        return new OpenAiImageModel(
            openAiImageApi,
            OpenAiImageOptions.builder()
                .model("dall-e-2")
                .build(),
            RetryTemplate.builder().maxAttempts(3).build(),
            ObservationRegistry.NOOP
        );
    }

    public String generateResponse(ChatRequest chatRequest, String apiKey) {
        ChatModel chatModel = createChatModel(apiKey);
        List<Message> messages = buildConversationMessages(chatRequest);
        Prompt prompt = new Prompt(messages);
        ChatResponse response = chatModel.call(prompt);
        return response.getResult().getOutput().getText();
    }

    public Flux<String> generateStreamResponse(String inputText, String apiKey){
        ChatModel chatModel = createChatModel(apiKey);
        Flux<String> streamResponse = ((OpenAiChatModel) chatModel).stream(inputText);
        return streamResponse;
    }

    public CricketResponse generateCricketResponse(ChatRequest chatRequest, String apiKey) throws IOException {
        ChatModel chatModel = createChatModel(apiKey);
        String template = this.loadPromptTemplate("prompts/cricket_bot_prompts.txt");
        String promptString = this.putValue(template, Map.of("InputText", chatRequest.getInputText()));
        
        List<Message> messages = buildConversationMessages(chatRequest);
        // Add the cricket prompt as system instruction by replacing the last user message
        if (!messages.isEmpty() && messages.get(messages.size() - 1) instanceof UserMessage) {
            messages.set(messages.size() - 1, new UserMessage(promptString));
        } else {
            messages.add(new UserMessage(promptString));
        }
        
        Prompt prompt = new Prompt(messages);
        ChatResponse cricketResponse = chatModel.call(prompt);

        String responseString = cricketResponse.getResult().getOutput().getText();
        
        // Clean the response string - remove markdown code blocks if present
        responseString = responseString.trim();
        if (responseString.startsWith("```json")) {
            responseString = responseString.substring(7);
        } else if (responseString.startsWith("```")) {
            responseString = responseString.substring(3);
        }
        if (responseString.endsWith("```")) {
            responseString = responseString.substring(0, responseString.length() - 3);
        }
        responseString = responseString.trim();
        
        ObjectMapper mapper = new ObjectMapper();
        CricketResponse cricketResponse1 = mapper.readValue(responseString, CricketResponse.class);
        return cricketResponse1;
    }

    public List<String> generateImages(ChatRequest chatRequest, int numbers, String apiKey) throws IOException {
        OpenAiImageModel imageModel = createImageModel(apiKey);
        String template = this.loadPromptTemplate("prompts/image_bot_prompts.txt");
        String promptString = this.putValue(template, Map.of( "description", chatRequest.getInputText() ));
              //  "numberOfImages", numbers + "",
              //   "description", imageDesc
              //  "size", size
       // ));
        ImageResponse imageResponse = imageModel.call(new ImagePrompt(promptString, OpenAiImageOptions.builder()
                .model("dall-e-2")
                .N(numbers)
                .height(512)
                .width(512)
                .build()
        ));
//        ImageResponse imageResponse = imageModel.call(new ImagePrompt(promptString));
        List<String> imageUrls = imageResponse.getResults().stream().map(generation ->generation.getOutput().getUrl()).collect(Collectors.toList());
        return imageUrls;
    }

    //load prompt from classpath
    public String loadPromptTemplate(String fileName) throws IOException {
        Path filePath = new ClassPathResource(fileName).getFile().toPath();
        return Files.readString(filePath);
    }

    //Put inputText in prompt
    public  String putValue(String template, Map<String,String> variables){
        for(Map.Entry<String,String> entry:variables.entrySet()){
            template = template.replace("{" + entry.getKey() + "}" ,entry.getValue());
        }
        return template;
    }

    // Build conversation messages from request, keeping only last 5 exchanges (10 messages)
    private List<Message> buildConversationMessages(ChatRequest chatRequest) {
        List<Message> messages = new ArrayList<>();
        
        // Add conversation history (limit to last 5 exchanges = 10 messages)
        if (chatRequest.getConversationHistory() != null && !chatRequest.getConversationHistory().isEmpty()) {
            List<ChatMessage> history = chatRequest.getConversationHistory();
            int startIndex = Math.max(0, history.size() - 10);
            
            for (int i = startIndex; i < history.size(); i++) {
                ChatMessage msg = history.get(i);
                if ("user".equals(msg.getRole())) {
                    messages.add(new UserMessage(msg.getContent()));
                } else if ("assistant".equals(msg.getRole())) {
                    messages.add(new AssistantMessage(msg.getContent()));
                }
            }
        }
        
        // Add current message
        messages.add(new UserMessage(chatRequest.getInputText()));
        
        return messages;
    }
}