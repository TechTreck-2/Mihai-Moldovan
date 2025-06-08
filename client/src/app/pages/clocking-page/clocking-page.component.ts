import { Component } from '@angular/core';
import { TimerComponent } from '../../components/timer/timer.component';
import { NotificationComponent } from '../../components/notification/notification.component';

@Component({
    selector: 'app-clocking-page',
    standalone: true,
    templateUrl: './clocking-page.component.html',
    styleUrl: './clocking-page.component.scss',
    imports: [TimerComponent, NotificationComponent]
})
export class ClockingPageComponent {

}
