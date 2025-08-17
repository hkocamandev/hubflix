import mongoose from 'mongoose';
import CoreDirector from '../models/CoreDirector';
import CoreMovie from '../models/CoreMovie';
import directorsData from './directors.json';
import moviesData from './movies.json'; 

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hubflix';

const importData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı.');

        // clear existing data
        await CoreDirector.deleteMany({});
        await CoreMovie.deleteMany({});
        console.log('Mevcut veriler temizlendi.');

        // insert Directors
        await CoreDirector.insertMany(directorsData);
        console.log('Yönetmenler başarıyla yüklendi.');

        // insert Movies
        await CoreMovie.insertMany(moviesData);
        console.log('Filmler başarıyla yüklendi.');

        process.exit();
    } catch (error) {
        console.error('Veri yüklenirken bir hata oluştu:', error);
        process.exit(1);
    }
};

importData();