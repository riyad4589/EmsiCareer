// Script de migration pour corriger le champ 'author' des offres
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Offre from '../models/offre.model.js';
import User from '../models/user.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/linkedin-clone';

async function fixOffersAuthor() {
  await mongoose.connect(MONGO_URI);
  const recruteur = await User.findOne({ role: 'recruteur' });
  if (!recruteur) {
    console.log('Aucun recruteur trouvé dans la base.');
    process.exit(1);
  }
  const result = await Offre.updateMany(
    { $or: [ { author: { $exists: false } }, { author: null } ] },
    { $set: { author: recruteur._id } }
  );
  console.log(`Offres mises à jour : ${result.modifiedCount}`);
  await mongoose.disconnect();
}

fixOffersAuthor(); 