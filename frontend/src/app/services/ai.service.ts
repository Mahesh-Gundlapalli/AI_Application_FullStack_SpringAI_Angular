import { environment } from './../../environments/environment.prod';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ConfigService } from './config.service';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  imageUrls?: string[];
}

export interface CricketResponse {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  private getHeaders(): HttpHeaders {
    const config = this.configService.getConfig();
    if (!config || !config.apiKey) {
      throw new Error('API key not configured');
    }
    return new HttpHeaders({
      'X-API-Key': config.apiKey
    });
  }

  sendMessage(message: string, type: 'chat' | 'cricket' | 'image', numberOfImages?: number, conversationHistory?: Message[]): Observable<Message> {
    if (type === 'chat') {
      return this.sendChatMessage(message, conversationHistory);
    } else if (type === 'cricket') {
      return this.sendCricketMessage(message, conversationHistory);
    } else {
      return this.sendImageMessage(message, numberOfImages || 1, conversationHistory);
    }
  }

  private sendChatMessage(inputText: string, conversationHistory?: Message[]): Observable<Message> {
    const body = {
      inputText: inputText,
      conversationHistory: this.prepareConversationHistory(conversationHistory)
    };

    return this.http.post<string>(`${this.apiUrl}/chat`, body, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      map(response => ({
        id: Date.now().toString(),
        content: response,
        role: 'assistant' as const,
        timestamp: new Date()
      })),
      catchError(error => {
        console.error('Chat API Error:', error);
        return of({
          id: Date.now().toString(),
          content: `Error: ${error.message || 'Unable to connect to the server. Please make sure the backend is running on port 8080.'}`,
          role: 'assistant' as const,
          timestamp: new Date()
        });
      })
    );
  }

  private sendCricketMessage(inputText: string, conversationHistory?: Message[]): Observable<Message> {
    const body = {
      inputText: inputText,
      conversationHistory: this.prepareConversationHistory(conversationHistory)
    };

    return this.http.post<CricketResponse>(`${this.apiUrl}/chat/cricket`, body, {
      headers: this.getHeaders()
    }).pipe(
      map(response => ({
        id: Date.now().toString(),
        content: response.content,
        role: 'assistant' as const,
        timestamp: new Date()
      })),
      catchError(error => {
        console.error('Cricket API Error:', error);
        return of({
          id: Date.now().toString(),
          content: `Error: ${error.message || 'Unable to connect to the cricket service. Please make sure the backend is running on port 8080.'}`,
          role: 'assistant' as const,
          timestamp: new Date()
        });
      })
    );
  }

  private sendImageMessage(inputText: string, numberOfImages: number = 1, conversationHistory?: Message[]): Observable<Message> {
    const body = {
      inputText: inputText,
      conversationHistory: this.prepareConversationHistory(conversationHistory)
    };
    const params = new HttpParams().set('numberOfImages', numberOfImages.toString());

    return this.http.post<string[]>(`${this.apiUrl}/chat/images`, body, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(imageUrls => ({
        id: Date.now().toString(),
        content: `🎨 Image generated successfully! Here ${imageUrls.length > 1 ? 'are your images' : 'is your image'}:`,
        role: 'assistant' as const,
        timestamp: new Date(),
        imageUrls: imageUrls
      })),
      catchError(error => {
        console.error('Image API Error:', error);
        return of({
          id: Date.now().toString(),
          content: `Error: ${error.message || 'Unable to Generate Image. Please Try Again After Some Time.'}`,
          role: 'assistant' as const,
          timestamp: new Date()
        });
      })
    );
  }

  // Stream response for chat (if you want to implement streaming later)
  streamChatMessage(inputText: string): Observable<string> {
    const params = new HttpParams().set('inputText', inputText);
    return this.http.get<string>(`${this.apiUrl}/chat/stream`, {
      params,
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  // Prepare conversation history for backend (keep only last 10 messages for context)
  private prepareConversationHistory(messages?: Message[]): any[] {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Filter out typing messages and system messages, keep only last 10
    const filteredMessages = messages
      .filter(m => !m.isTyping && m.id !== '1' && m.id !== 'typing')
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    return filteredMessages;
  }
}
