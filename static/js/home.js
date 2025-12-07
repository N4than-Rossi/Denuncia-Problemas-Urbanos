document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelector('.slides');
    const images = document.querySelectorAll('.slides img');
    
    const firstClone = images[0].cloneNode(true);
    slides.appendChild(firstClone);
    
    let index = 0;
    const totalSlides = images.length;
    
    setInterval(() => {
        index++;
        slides.style.transform = `translateX(-${index * 100}%)`;
        
        if (index === totalSlides) {
            setTimeout(() => {
                slides.style.transition = 'none';
                index = 0;
                slides.style.transform = 'translateX(0)';
                setTimeout(() => {
                    slides.style.transition = 'transform 0.8s ease';
                });
            }, 800);
        }
    }, 4000);

    const passos = document.querySelectorAll('.passo');

    passos.forEach(passo => {
        passo.addEventListener('mouseenter', function(){
            passos.forEach(p => p.classList.remove('ativo'));
            this.classList.add('ativo');
        });
    });

    document.querySelector('.timeline').addEventListener('mouseleave', () => {
        passos.forEach(p => p.classList.remove('ativo'));
        passos[0].classList.add('ativo');
    });

    const faqItems = document.querySelectorAll('.faq-item');

    if(faqItems.length > 0){
        faqItems[0].classList.add('ativo');
    }

    faqItems.forEach(item => {
        const pergunta = item.querySelector('.faq-pergunta');

        pergunta.addEventListener('click', function(){
            const isActive = item.classList.contains('ativo');

            faqItems.forEach(faq => {
                faq.classList.remove('ativo');
            });

            if(!isActive){
                item.classList.add('ativo');
            }
        });
    });
});