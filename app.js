// Cargar lista de poemas desde Firestore
document.addEventListener('DOMContentLoaded', () => {
    const poemsList = document.getElementById('poems');
    
    db.collection('poems').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const poem = doc.data();
            const li = document.createElement('li');
            li.textContent = poem.title;
            li.addEventListener('click', () => {
                window.location.href = `poem.html?id=${doc.id}`;
            });
            poemsList.appendChild(li);
        });
    });
});