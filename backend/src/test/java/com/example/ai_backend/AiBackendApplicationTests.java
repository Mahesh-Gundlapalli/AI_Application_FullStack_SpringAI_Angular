package com.example.ai_backend;

import com.example.ai_backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;

@SpringBootTest
class AiBackendApplicationTests {

	@Autowired
	private ChatService chatService;

	@Test
	void contextLoads() {

	}

	@Test
	void testTemplate() throws IOException {
		String str = chatService.loadPromptTemplate("Prompts/cricket_bot_prompts.txt");
		System.out.println(str);
	}

}
