# AI-Powered Full-Stack Application

A modern full-stack web application that leverages OpenAI's powerful APIs to provide intelligent chat conversations, cricket-specific Q&A, and AI-powered image generation. Built with Spring Boot and Angular, this application features a beautiful UI with conversation memory and secure API key management.

## ✨ Features

- **🤖 AI Chat Assistant**: Engage in natural conversations with GPT-4o-mini, with context-aware responses that remember your last 5 exchanges
- **🏏 Cricket Bot**: Specialized chatbot for cricket enthusiasts - ask about history, rules, strategies, players, and teams
- **🎨 AI Image Generator**: Create stunning images from text descriptions using DALL-E 2
- **🔐 Secure API Key Management**: Users provide their own OpenAI API keys through a secure dialog interface
- **💬 Conversation Memory**: Each chat section independently remembers the last 5 conversation exchanges for contextual follow-up questions
- **👤 Personalized Experience**: User identification with initials displayed in chat bubbles
- **🔄 Sign Out & Clear**: Complete session cleanup with config and chat history removal
- **🎯 Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.5.10** - Enterprise Java framework
- **Spring AI 1.1.2** - AI integration framework
- **OpenAI API** - GPT-4o-mini and DALL-E 2
- **Maven** - Dependency management
- **Java 17+** - Programming language

### Frontend
- **Angular 18+** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Standalone Components** - Modern Angular architecture
- **CSS3** - Styling with gradients and animations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher
- **Node.js 18** or higher
- **npm** or **yarn**
- **Maven 3.6+**
- **OpenAI API Key** - [Get your API key here](https://platform.openai.com/api-keys)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Powered-Full-Stack-Application.git
cd AI-Powered-Full-Stack-Application
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

The frontend application will be available at `http://localhost:4200`

## ⚙️ Configuration

### Backend Configuration

The backend uses a placeholder API key in `application.properties` to satisfy Spring AI auto-configuration. Users provide their actual API keys through the UI.

```properties
# backend/src/main/resources/application.properties
spring.ai.openai.api-key=sk-placeholder-api-key-not-used
spring.ai.openai.base-url=https://api.openai.com
spring.ai.openai.chat.options.model=gpt-4o-mini
spring.ai.openai.chat.options.temperature=0.7
```

### Frontend Configuration

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1'
};
```

## 🎯 Usage

1. **Launch the Application**
   - Start both backend and frontend servers
   - Navigate to `http://localhost:4200`

2. **First-Time Setup**
   - A configuration dialog will appear
   - Enter your **Name** (for personalization)
   - Enter your **OpenAI API Key** (must start with `sk-`)
   - Click "Save Configuration"

3. **Start Chatting**
   - **AI Chat**: General purpose conversations with context awareness
   - **Cricket Bot**: Cricket-specific questions and discussions
   - **Image Generator**: Describe images to generate (1-10 images per request)

4. **Sign Out**
   - Click the sign-out button to clear your API key and chat history
   - You'll be redirected to enter new credentials

## 📡 API Endpoints

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Send chat message with conversation history |
| POST | `/api/v1/chat/cricket` | Send cricket-specific query with history |
| POST | `/api/v1/chat/images?numberOfImages=N` | Generate N images from description |
| GET | `/api/v1/chat/stream` | Stream chat responses (SSE) |

### Request Headers

All endpoints require:
```
X-API-Key: <your-openai-api-key>
```

### Request Body (POST)

```json
{
  "inputText": "Your message here",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

## 📁 Project Structure

```
AI-Powered-Full-Stack-Application/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/ai_backend/
│   │   │   │   ├── controller/
│   │   │   │   │   └── ChatController.java
│   │   │   │   ├── service/
│   │   │   │   │   └── ChatService.java
│   │   │   │   ├── payload/
│   │   │   │   │   ├── ChatMessage.java
│   │   │   │   │   ├── ChatRequest.java
│   │   │   │   │   └── CricketResponse.java
│   │   │   │   └── AiBackendApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── Prompts/
│   │   │           ├── cricket_bot_prompts.txt
│   │   │           └── image_bot_prompts.txt
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── sidemenu/
│   │   │   │   └── config-dialog/
│   │   │   ├── pages/
│   │   │   │   ├── chat/
│   │   │   │   ├── cricket/
│   │   │   │   └── image/
│   │   │   ├── services/
│   │   │   │   ├── ai.service.ts
│   │   │   │   └── config.service.ts
│   │   │   └── app.component.ts
│   │   ├── environments/
│   │   ├── index.html
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔒 Security

- **API Keys**: Never commit your OpenAI API keys to version control
- **Session Storage**: API keys are stored in browser session storage (cleared on tab close)
- **CORS**: Backend is configured for `http://localhost:4200` in development
- **Headers**: API keys are transmitted via custom `X-API-Key` header

## 🚀 Deployment

### Backend Deployment

1. Update CORS configuration in [ChatController.java](backend/src/main/java/com/example/ai_backend/controller/ChatController.java)
2. Build production JAR:
   ```bash
   mvn clean package -DskipTests
   ```
3. Deploy `target/*.jar` to your server

### Frontend Deployment

1. Update `environment.prod.ts` with production API URL
2. Build for production:
   ```bash
   ng build --configuration production
   ```
3. Deploy `dist/` folder to your hosting service

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing powerful AI APIs
- [Spring AI](https://docs.spring.io/spring-ai/reference/) for seamless AI integration
- [Angular](https://angular.io/) for the robust frontend framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---


<img width="1919" height="911" alt="Screenshot 2026-02-11 084824" src="https://github.com/user-attachments/assets/65d829f5-7cdc-496f-90ec-5507e544a535" />
<img width="1919" height="910" alt="Screenshot 2026-02-11 085239" src="https://github.com/user-attachments/assets/3046552b-6892-4f7d-a7d0-89cf82f3236d" />
<img width="1919" height="907" alt="Screenshot 2026-02-11 084750" src="https://github.com/user-attachments/assets/df957425-cdbb-4155-922f-bae74ff7b164" />
<img width="1919" height="910" alt="Screenshot 2026-02-11 085239" src="https://github.com/user-attachments/assets/259dcc24-a6ed-4853-9651-26035403fe66" />
<img width="1919" height="906" alt="Screenshot 2026-02-11 084928" src="https://github.com/user-attachments/assets/d239d248-13cb-4205-975c-8af06e57245a" />
<img width="1919" height="911" alt="Screenshot 2026-02-11 084913" src="https://github.com/user-attachments/assets/7b81ea41-a174-4c5a-bb34-e66b4f385090" />




**Made with using Spring Boot and Angular**
