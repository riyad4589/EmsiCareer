import mongoose from "mongoose";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";

const testPosts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/linkedin-clone');
        console.log('Connecté à MongoDB');

        // Récupérer tous les posts avec leurs auteurs
        const posts = await Post.find({})
            .populate("author", "name username role companyName industry")
            .sort({ createdAt: -1 });

        console.log('\n=== TOUS LES POSTS ===');
        posts.forEach((post, index) => {
            console.log(`${index + 1}. Post ID: ${post._id}`);
            console.log(`   Contenu: ${post.content.substring(0, 50)}...`);
            console.log(`   Auteur: ${post.author?.name} (${post.author?.username})`);
            console.log(`   Rôle: ${post.author?.role}`);
            console.log(`   Entreprise: ${post.author?.companyName || 'N/A'}`);
            console.log(`   Secteur: ${post.author?.industry || 'N/A'}`);
            console.log(`   Visibilité: ${post.visibility}`);
            console.log(`   Date: ${post.createdAt}`);
            console.log('---');
        });

        // Filtrer les posts des recruteurs
        const recruiterPosts = posts.filter(post => post.author?.role === "recruteur");
        
        console.log('\n=== POSTS DES RECRUTEURS ===');
        console.log(`Nombre total: ${recruiterPosts.length}`);
        recruiterPosts.forEach((post, index) => {
            console.log(`${index + 1}. ${post.author?.companyName || 'Entreprise'} - ${post.content.substring(0, 50)}...`);
        });

        // Vérifier les utilisateurs recruteurs
        const recruiters = await User.find({ role: "recruteur" }).select("name username companyName industry");
        console.log('\n=== UTILISATEURS RECRUTEURS ===');
        console.log(`Nombre total: ${recruiters.length}`);
        recruiters.forEach((recruiter, index) => {
            console.log(`${index + 1}. ${recruiter.name} (${recruiter.username})`);
            console.log(`   Entreprise: ${recruiter.companyName || 'N/A'}`);
            console.log(`   Secteur: ${recruiter.industry || 'N/A'}`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
    }
};

testPosts(); 