import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { SharedModule } from '../../utils/shared.component';
import { AiService, Message } from '../../services/ai.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  numberOfImages: number = 1;
  private shouldScroll: boolean = false;

  constructor(
    private aiService: AiService,
    private configService: ConfigService
  ) {
    this.messages.push({
      id: '1',
      content: '🎨 Welcome to AI Image Generator! Describe the image you want to create, and I\'ll generate it for you. Be as detailed as possible for best results!',
      role: 'assistant',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: this.userInput,
      role: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.shouldScroll = true;

    const messageCopy = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    const typingMessage: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMessage);
    this.shouldScroll = true;

    // Pass conversation history (excluding the typing message and current user message)
    const conversationHistory = this.messages.filter(m => m.id !== 'typing').slice(0, -1);

    this.aiService.sendMessage(messageCopy, 'image', this.numberOfImages, conversationHistory).subscribe({
      next: (response) => {
        this.messages = this.messages.filter(m => m.id !== 'typing');
        this.messages.push(response);
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: (error) => {
        console.error('Error:', error);
        this.messages = this.messages.filter(m => m.id !== 'typing');
        this.isLoading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  clearChat() {
    this.messages = [{
      id: '1',
      content: '🎨 Chat cleared! Describe your next image creation!',
      role: 'assistant',
      timestamp: new Date()
    }];
  }

  get userInitial(): string {
    const config = this.configService.getConfig();
    if (config && config.userName) {
      return config.userName.charAt(0).toUpperCase();
    }
    return 'U';
  }
}
