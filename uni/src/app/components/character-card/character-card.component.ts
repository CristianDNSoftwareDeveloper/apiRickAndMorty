import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="character.status.toLowerCase()">
      <div class="card-image-container">
        <img [src]="character.image" [alt]="character.name" loading="lazy">
        <div class="status-badge" [ngClass]="character.status.toLowerCase()">
          {{ character.status }}
        </div>
      </div>
      <div class="card-content">
        <h3>{{ character.name }}</h3>
        <p class="species">
          <span class="label">Species:</span> {{ character.species }}
        </p>
        <p class="origin">
          <span class="label">Origin:</span><br>
          {{ character.origin.name }}
        </p>
        <p class="location">
          <span class="label">Last known location:</span><br>
          {{ character.location.name }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .card-image-container {
      position: relative;
      width: 100%;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      overflow: hidden;
    }

    .card-image-container img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .card:hover img {
      transform: scale(1.1);
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .status-badge.alive { background: rgba(5, 150, 105, 0.8); color: #fff; }
    .status-badge.dead { background: rgba(220, 38, 38, 0.8); color: #fff; }
    .status-badge.unknown { background: rgba(107, 114, 128, 0.8); color: #fff; }

    .card-content {
      padding: 1.5rem;
      flex-grow: 1;
    }

    h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1.25rem;
      color: #fff;
      font-weight: 700;
    }

    p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: #9ca3af;
    }

    .label {
      color: #6b7280;
      font-size: 0.8rem;
    }
  `]
})
export class CharacterCardComponent {
  @Input() character!: Character;
}
