# 🛍️ Mobile App

Această aplicație mobilă folosește entitatea **Produs** pentru a gestiona o listă de articole. Aplicația este structurată în două ecrane principale:

## 📋 Ecranul 1: Lista de Produse
- **Listă de Produse**: Aici poți vizualiza toate produsele disponibile. 🛒
- **Funcționalitate**: Poți selecta un produs existent pentru a-l edita. ✏️

## ➕ Ecranul 2: Adăugare/Editează Produs
- **Adaugă Produs**: Când apeși pe butonul **+**, poți adăuga un nou produs la listă. 🎉
- **Editează Produs**: Dacă selectezi un produs existent, poți modifica detaliile acestuia. 🔧

## 🏷️ Entitatea Produs
Entitatea **Produs** conține următoarele câmpuri:
- `id`: Identificatorul unic al produsului. 🆔
- `name`: Numele produsului. 📛
- `price`: Prețul produsului. 💰
- `category`: Categoria din care face parte produsul. 🏷️
- `inStock`: Starea de disponibilitate a produsului. ✅
- `version`: Versiunea produsului pentru gestionarea actualizărilor. 📅

## ⚙️ Tehnologii Folosite
- **React**: Biblioteca principală pentru construirea interfeței utilizator. ⚛️
- **Ionic**: Cadru pentru dezvoltarea aplicațiilor mobile. 📱
- **WebSocket**: Comunicație în timp real cu serverul pentru actualizarea listei de produse. 🌐
