import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp(config);
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123")
  .then(() => {
    console.log("Usuário admin@admin.com criado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro:", error.message);
    process.exit(1);
  });
