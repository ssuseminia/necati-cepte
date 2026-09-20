const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const admin=require('firebase-admin');
admin.initializeApp();
exports.pushNecatiNotification=onDocumentCreated('couples/{coupleId}/notifications/{notificationId}',async event=>{
  const n=event.data?.data(); if(!n)return;
  const coupleId=event.params.coupleId;
  const devices=await admin.firestore().collection('couples').doc(coupleId).collection('devices').get();
  const tokens=devices.docs.map(d=>d.data()).filter(d=>d.token&&d.uid!==n.senderUid).map(d=>d.token);
  if(!tokens.length)return;
  await admin.messaging().sendEachForMulticast({tokens,data:{title:String(n.title||'Necati Cepte ❤️'),body:String(n.body||'Yeni bir bildirim var'),url:'./'}});
});
