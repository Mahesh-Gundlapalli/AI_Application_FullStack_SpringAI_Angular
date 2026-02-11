import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.css']
})
export class ConfigDialogComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  userName: string = '';
  apiKey: string = '';
  errorMessage: string = '';

  constructor(private configService: ConfigService) { }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.userName.trim()) {
      this.errorMessage = 'Please enter your name';
      return;
    }

    if (!this.apiKey.trim()) {
      this.errorMessage = 'Please enter your OpenAI API key';
      return;
    }

    if (!this.apiKey.startsWith('sk-')) {
      this.errorMessage = 'Invalid API key format. It should start with "sk-"';
      return;
    }

    this.configService.setConfig({
      userName: this.userName.trim(),
      apiKey: this.apiKey.trim()
    });

    this.close.emit();
  }

  onCancel(): void {
    this.errorMessage = '';
    this.close.emit();
  }
}
