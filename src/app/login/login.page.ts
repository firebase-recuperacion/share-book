import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(public alertController: AlertController) {}

  segment: string = 'login';

  ngOnInit() {}

  segmentChanged({ detail: { value } }) {
    this.segment = value;
  }
}
