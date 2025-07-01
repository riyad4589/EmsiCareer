import mongoose from 'mongoose';

const uri = 'mongodb+srv://admin:admin@cluster0.kplwhsj.mongodb.net/EMSI_Carrer?retryWrites=true&w=majority&appName=Cluster0';

const main = async () => {
  await mongoose.connect(uri);
  const demandes = await mongoose.connection.collection('connectionrequests').find({}).toArray();
  console.log(demandes);
  await mongoose.disconnect();
};

main();