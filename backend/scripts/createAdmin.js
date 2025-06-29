import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { User } from '../models/user.model.js'; // Vérifie que l'export est bien fait avec "export"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env depuis le bon chemin
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdminUser = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI not found in .env file');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const name = process.argv[2] || 'Admin User';
        const emailEdu = process.argv[3] || 'admin@emsi-edu.ma';
        const username = process.argv[4] || 'admin';
        const password = process.argv[5] || 'admin123';

        const existingUser = await User.findOne({ emailEdu });
        if (existingUser) {
            console.error(`User with educational email ${emailEdu} already exists.`);
            process.exit(1);
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            console.error(`User with username ${username} already exists.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = new User({
            name,
            emailEdu,
            username,
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully:');
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Email: ${adminUser.emailEdu}`);
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Role: ${adminUser.role}`);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createAdminUser();
