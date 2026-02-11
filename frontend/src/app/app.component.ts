import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ImageComponent } from './pages/image/image.component';
import { ChatComponent } from './pages/chat/chat.component';
import { CricketComponent } from './pages/cricket/cricket.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { ConfigDialogComponent } from './components/config-dialog/config-dialog.component';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImageComponent, ChatComponent, CricketComponent, SidemenuComponent, ConfigDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ai-frontend';
  isDarkMode = true;
  showConfigDialog = false;

  constructor(
    private renderer: Renderer2,
    private configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Show config dialog if not configured
    if (!this.configService.isConfigured()) {
      this.showConfigDialog = true;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.isDarkMode ? 'dark' : 'light';
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  onConfigDialogClose() {
    this.showConfigDialog = false;
  }

  openConfigDialog() {
    this.showConfigDialog = true;
  }

  onSignOut() {
    // Clear configuration
    this.configService.clearConfig();

    // Clear localStorage for any stored data (chat history)
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('cricketHistory');
    localStorage.removeItem('imageHistory');

    // Navigate to chat page and reload
    this.router.navigate(['/chat']).then(() => {
      // Reload the page to clear all component state
      window.location.reload();
    });
  }
}
