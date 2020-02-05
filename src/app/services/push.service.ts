import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {
   mensajes: OSNotificationPayload[] = [];
   userId: string;
   pushListener = new EventEmitter<OSNotificationPayload>();

   constructor(private oneSignal: OneSignal,
               private storage: Storage) {
      this.cargarMensajes();
   }

   configuracionInicial() {
      this.oneSignal.startInit('f3e537d6-18b4-47eb-9f91-f8e8907a0e2e', '902841741266');
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((noti) => { // do something when notification is received
         console.log('Notificacion recicida', noti);
         this.notificacionRecibida(noti);
      });
      this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {// do something when a notification is opened
         console.log('Notificacion abierta', noti);
         await this.notificacionRecibida(noti.notification);
      });
      this.oneSignal.getIds().then(info => {
         this.userId = info.userId;
      });
      this.oneSignal.endInit();
   }

   async notificacionRecibida(noti: OSNotification) {
      await this.cargarMensajes();
      const existePush = this.mensajes.find(mensaje => mensaje.notificationID === noti.payload.notificationID);
      if (existePush) {
         return;
      }
      this.mensajes.unshift(noti.payload);
      this.pushListener.emit(noti.payload);
      await this.guardarMensajes();
   }

   async getMensajes() {
      await this.cargarMensajes();
      return [...this.mensajes];
   }

   guardarMensajes() {
      this.storage.set('mensajes', this.mensajes);
   }

   async cargarMensajes() {
      this.mensajes = await this.storage.get('mensajes') || [];
      return this.mensajes;
   }

   borrarMensajes() {
      // this.storage.remove('mensajes');
      this.storage.clear();
      this.mensajes = [];
      this.guardarMensajes();
   }
}
