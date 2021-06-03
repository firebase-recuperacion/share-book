import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../alert.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss'],
})
export class ListPage implements OnInit {
  constructor(
    public auth: AuthService,
    public fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore,
    private fireStorage: AngularFireStorage,
    public alert: AlertService,
    private router: Router
  ) {}

  books$: BehaviorSubject<any> = new BehaviorSubject([]);
  booksCache = [];

  ngOnInit() {}

  ionViewDidEnter() {
    this.getBooks();
  }

  async onReserve(book) {
    await this.alert.presentLoading();
    try {
      const currentUser = await this.fireAuth.currentUser;
      const bookRef = await this.fireStore.collection('books').doc(book.uid);
      await bookRef.update({
        reserved: currentUser.uid,
      });
      await this.alert.loading.dismiss();
      this.router.navigate(['books']);
    } catch (err) {
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  async getBooks() {
    const booksRef = this.fireStore.collection('books', (ref) => {
      return ref.where('reserved', '==', false);
    });
    const result = [];
    try {
      const { docs }: { docs: any } = await booksRef.get().toPromise();
      for await (let doc of docs) {
        const storageRef = this.fireStorage.ref(`books/${doc.id}`);
        const ownerRef = await this.fireStore
          .collection('users')
          .doc(doc.data().owner);
        const owner: any = (await ownerRef.get()).toPromise();
        const photoObservable = await storageRef.getDownloadURL();
        const photoUrl = await photoObservable.toPromise();
        const ownerData = (await owner).data();
        const data: Object = doc.data();
        result.push({
          ...data,
          photo: photoUrl,
          uid: doc.id,
          ownerName: ownerData.name,
        });
      }
      await this.alert.loading.dismiss();
      this.books$.next(result);
      this.booksCache = this.books$.value;
    } catch (err) {
      console.log(err);
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  filterBooks(event) {
    const value = event.target.value.toLowerCase();
    this.books$.next(
      this.books$.value.filter((item) => {
        return (
          item.title.toLowerCase().includes(value) ||
          item.category.toLowerCase().includes(value)
        );
      })
    );
    if (!value) {
      this.books$.next(this.booksCache);
    }
  }
}
