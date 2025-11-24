import { Component, OnInit } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';

@Component({
  selector: 'app-zoneless',
  templateUrl: './zoneless.component.html',
  styleUrls: ['./zoneless.component.css'],
  standalone: true,
  imports: [Highlight]
})
export class ZonelessComponent implements OnInit {
  configureZonelessApp = `
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Use this instead of provideZoneChangeDetection
    provideRouter(routes),
    provideNgIdleKeepalive(),
    provideHttpClient(withFetch())
  ]
};
  `;

  configureZonelessWithSignals = `
import { Component, OnInit, signal, computed } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  // Use signals for reactive state management
  idleState = signal<string>("NOT_STARTED");
  countdown = signal<number | null>(null);
  lastPing = signal<Date | null>(null);

  // Computed signal for display
  statusMessage = computed(() => {
    const state = this.idleState();
    if (state === "IDLE" && this.countdown() !== null) {
      return \`Inactive - Timeout in \${this.countdown()}s\`;
    }
    return state;
  });

  constructor(private idle: Idle, private keepalive: Keepalive) {
    // Configure idle parameters
    idle.setIdle(5);
    idle.setTimeout(5);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // Update signals when idle state changes
    idle.onIdleStart.subscribe(() => {
      this.idleState.set("IDLE");
    });

    idle.onIdleEnd.subscribe(() => {
      this.idleState.set("NOT_IDLE");
      this.countdown.set(null);
    });

    idle.onTimeout.subscribe(() => {
      this.idleState.set("TIMED_OUT");
    });

    idle.onTimeoutWarning.subscribe((seconds) => {
      this.countdown.set(seconds);
    });

    // Configure keepalive
    keepalive.interval(15);
    keepalive.onPing.subscribe(() => {
      this.lastPing.set(new Date());
    });
  }

  reset() {
    this.idle.watch();
    this.idleState.set("NOT_IDLE");
    this.countdown.set(null);
    this.lastPing.set(null);
  }

  ngOnInit(): void {
    this.reset();
  }
}
  `;

  configureZonelessTemplate = `
<div class="idle-status">
  <h2>Idle Status</h2>
  <p>State: {{ idleState() }}</p>
  <p>Status: {{ statusMessage() }}</p>
  @if (lastPing()) {
    <p>Last ping: {{ lastPing() | date:'medium' }}</p>
  }
  @if (idleState() === 'TIMED_OUT') {
    <button (click)="reset()">Reset</button>
  }
</div>
  `;

  configureZonelessWithOnPush = `
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  idleState = "NOT_STARTED";
  countdown: number | null = null;
  lastPing: Date | null = null;

  constructor(
    private idle: Idle,
    private keepalive: Keepalive,
    private cdr: ChangeDetectorRef
  ) {
    idle.setIdle(5);
    idle.setTimeout(5);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleStart.subscribe(() => {
      this.idleState = "IDLE";
      this.cdr.markForCheck(); // Manually trigger change detection
    });

    idle.onIdleEnd.subscribe(() => {
      this.idleState = "NOT_IDLE";
      this.countdown = null;
      this.cdr.markForCheck();
    });

    idle.onTimeout.subscribe(() => {
      this.idleState = "TIMED_OUT";
      this.cdr.markForCheck();
    });

    idle.onTimeoutWarning.subscribe((seconds) => {
      this.countdown = seconds;
      this.cdr.markForCheck();
    });

    keepalive.interval(15);
    keepalive.onPing.subscribe(() => {
      this.lastPing = new Date();
      this.cdr.markForCheck();
    });
  }

  reset() {
    this.idle.watch();
    this.idleState = "NOT_IDLE";
    this.countdown = null;
    this.lastPing = null;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.reset();
  }
}
  `;

  benefitsZoneless = `
## Benefits of Zoneless Angular

1. **Better Performance**: No zone.js overhead means faster change detection
2. **Smaller Bundle Size**: Removing zone.js reduces your application size
3. **More Predictable**: Explicit change detection gives you more control
4. **Better Debugging**: Easier to understand when and why changes occur
5. **Modern Patterns**: Encourages use of signals and reactive patterns
  `;

  considerationsZoneless = `
## Important Considerations

1. **Signals Recommended**: Use signals for reactive state management instead of ChangeDetectorRef
2. **OnPush Components**: If not using signals, use OnPush change detection strategy
3. **Manual Change Detection**: You may need to manually trigger change detection in some cases
4. **Event Handling**: Event handlers automatically trigger change detection
5. **Async Operations**: Use signals or markForCheck() after async operations
  `;

  typescript = ['typescript'];
  html = ['html'];
  markdown = ['markdown'];

  constructor() { }

  ngOnInit(): void {
  }
}

