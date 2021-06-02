import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfilePage } from './profile.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { SignupFormComponent } from '../login/signup-form/signup-form.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ProfilePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ProfilePage, SignupFormComponent],
})
export class ProfilePageModule {}
