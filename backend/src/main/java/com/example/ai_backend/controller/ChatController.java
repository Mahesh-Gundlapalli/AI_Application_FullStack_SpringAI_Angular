package com.example.ai_backend.controller;

import com.example.ai_backend.payload.ChatRequest;
import com.example.ai_backend.payload.CricketResponse;
import com.example.ai_backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/chat")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<String> generateResponse(
            @RequestBody ChatRequest chatRequest,
            @RequestHeader("X-API-Key") String apiKey
    ){
        String responseText =  chatService.generateResponse(chatRequest, apiKey);
        return ResponseEntity.ok(responseText);
    }

    // Keep GET endpoint for backward compatibility
    @GetMapping
    public ResponseEntity<String> generateResponseGet(
            @RequestParam(value = "inputText") String inputText,
            @RequestHeader("X-API-Key") String apiKey
    ){
        ChatRequest chatRequest = new ChatRequest(inputText, null);
        String responseText =  chatService.generateResponse(chatRequest, apiKey);
        return ResponseEntity.ok(responseText);
    }

    @GetMapping("/stream")
    public Flux<String> generateStreamResponse(
            @RequestParam(value = "inputText") String inputText,
            @RequestHeader("X-API-Key") String apiKey
    ){
        Flux<String> response = chatService.generateStreamResponse(inputText, apiKey);
        return response;
    }

    @PostMapping("/cricket")
    public CricketResponse generateCricketResponse(
            @RequestBody ChatRequest chatRequest,
            @RequestHeader("X-API-Key") String apiKey
    ) throws IOException {
        return chatService.generateCricketResponse(chatRequest, apiKey);
    }

    // Keep GET endpoint for backward compatibility
    @GetMapping("/cricket")
    public CricketResponse generateCricketResponseGet(
            @RequestParam("inputText") String inputText,
            @RequestHeader("X-API-Key") String apiKey
    ) throws IOException {
        ChatRequest chatRequest = new ChatRequest(inputText, null);
        return chatService.generateCricketResponse(chatRequest, apiKey);
    }

    @PostMapping("/images")
    public ResponseEntity<List<String>> generateImages(
            @RequestBody ChatRequest chatRequest,
            @RequestParam(value = "numberOfImages", required = false, defaultValue = "1") int numbers,
            @RequestHeader("X-API-Key") String apiKey
    ) throws IOException {
        return ResponseEntity.ok(chatService.generateImages(chatRequest, numbers, apiKey));
    }

    // Keep GET endpoint for backward compatibility
    @GetMapping("/images")
    public ResponseEntity<List<String>> generateImagesGet(
            @RequestParam("imageDescription") String imageDesc,
            @RequestParam(value = "numberOfImages", required = false, defaultValue = "1") int numbers,
            @RequestHeader("X-API-Key") String apiKey
    ) throws IOException {
        ChatRequest chatRequest = new ChatRequest(imageDesc, null);
        return ResponseEntity.ok(chatService.generateImages(chatRequest, numbers, apiKey));
    }
}
