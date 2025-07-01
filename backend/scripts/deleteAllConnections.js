import mongoose from 'mongoose';

const uri = 'mongodb+srv://admin:admin@cluster0.kplwhsj.mongodb.net/EMSI_Carrer?retryWrites=true&w=majority&appName=Cluster0';

const main = async () => {
  await mongoose.connect(uri);

  // Suppression des demandes de connexion
  await mongoose.connection.collection('connectionrequests').deleteMany({});
  // Suppression des connexions
  await mongoose.connection.collection('connections').deleteMany({});

  console.log('Toutes les demandes de connexion et connexions ont été supprimées.');
  await mongoose.disconnect();
};

main();