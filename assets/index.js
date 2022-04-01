const canvas = document.querySelector('canvas');
//recup canvas
const c = canvas.getContext("2d")

canvas.width = innerWidth;
canvas.height = innerHeight;
//canvas prend toute la taille

const scoreEl =document.getElementById('scoreEl')
const startBtn = document.getElementById('startBtn')
const modalEl = document.getElementById('modalEl')
const bigScoreEl = document.getElementById('bigScoreEl')


class Player { //crée un joueur
    constructor (x, y, radius, color){
        this.x = x  // position x
        this.y = y  // position y
        this.radius = radius // taille
        this.color = color // couleur
    } 
    draw () //function qui dessine 
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false ) //dessine un cercle
        c.fillStyle = this.color // couleur donnée
        c.fill()// rempli le cercle
    } 
}

class Projectile { //crée projectile
    constructor(x, y, radius, color, velocity)
    {
        this.x = x 
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw ()
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false )
        c.fillStyle = this.color
        c.fill()
    } 
    
    update ()//permet le déplacement des cercles dans le canvas
    {
        this.draw();
        this.x = this.x + this.velocity.x // celui du projectile voir l'eventListenner / se dirige vers là ou on clique 
        this.y = this.y + this.velocity.y
    }
}

class Enemy { //crée les enemies
    constructor(x, y, radius, color, velocity)
    {
        this.x = x 
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw ()
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false )
        c.fillStyle = this.color
        c.fill()
    } 
    
    update ()
    {
        this.draw();
        this.x = this.x + this.velocity.x // se dirige vers le joueur / voir spawnEnnemy
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98 //ralenti les particules (baisse pour ralentir plus)

class Particule { //crée les particules
    constructor(x, y, radius, color, velocity)
    {
        this.x = x 
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw ()
    {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false )
        c.fillStyle = this.color
        c.fill()
        c.restore()
    } 
    
    update ()
    {
        this.draw();
        this.velocity.x *=friction
        this.velocity.y *=friction
        this.x = this.x + this.velocity.x // se dirige vers le joueur / voir spawnEnnemy
        this.y = this.y + this.velocity.y
        this.alpha-=0.01
    }
}

const x = canvas.width/2//centre de la page
const y = canvas.height/2

let player = new Player(x, y , 15, 'white');// crée le joueur avec ces paramètres
// player.draw();// affiche le joeueur /à retirer car dans anime

let projectiles = [] //tableau de projectiles
let enemies = [] // tableau des ennemies
let particules = [] // tableau des particules

function init () {
    
    player = new Player(x, y , 15, 'white');// crée le joueur avec ces paramètres
    projectiles = [] //tableau de projectiles
    enemies = [] // tableau des ennemies
    particules = [] // tableau des particules
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    
    
    
    modalEl.classList.add ('d-none')
    
}

function spawnEnemies()
{
    setInterval(()=> {
        const radius = Math.random() * (35 - 5) + 5 // 30 = taille max / 7 = taille min

        let x
        let y

        if (Math.random() < 0.5 ) { //une chance sur 2 d'apparaitre gauche/droite ou haut/bas
            x = Math.random() < 0.5 ? //une chance sur 2 gauche ou droite
            0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? // une chance sur 2 haut ou bas
            0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random()*360},50%,50%`
        
        const angle = Math.atan2(//calcul de l'angle à partir de la ou il apparait vers le joueur
            canvas.height/2 - y,// calcul l'angle pour aller vers le joeur
            canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle) * 0.7, //CHANGE LES VALEURS POUR MODIFIER LA VITESSE DES ENEMIES
            y: Math.sin(angle) * 0.7
}
        enemies.push(new Enemy(x, y, radius, color, velocity))// rajoute dans le tableau
    }, 1000) // crée un ennemi tout les secondes
}

let animationId
let score = 0

function animate()
{
    animationId = requestAnimationFrame(animate)// fait boucler la function
    c.fillStyle = ('rgba(0, 0, 0, 0.1')
    c.fillRect(0, 0, canvas.width, canvas.height) // clear le canvas à chaque itérations
    player.draw();// redessine le joueur à chaque itération

    
    

    particules.forEach((particule, index)=>{//permet aux particules de disparaitres une fois qu'elles ont ralenties
        if (particule.alpha <= 0)
        {
            particules.splice(index, 1)
        } else
        {
            particule.update() 
        }
        
    })
    projectiles.forEach((projectile, index) => { //update la position de tout les projetctiles du tableau
       
        projectile.update()

        //supprime les projectiles qui sortent de l'écran
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index,1)
            },0)
        }
    })

    enemies.forEach((enemy, index)=>{ // same
        enemy.update()
        
        const dist = Math.hypot(player.x - enemy.x, player.y -enemy.y)//fin de la partie
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)

                bigScoreEl.innerHTML = score
                modalEl.classList.remove('d-none') 
                              

           }


        projectiles.forEach((projectile, projectileIndex) => {
           const dist =  Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // quand le projectile et l'ennemi se touche
           if (dist - enemy.radius - projectile.radius < 1)
           {
               let alea = Math.random(); // crée un variable aléatoire à chaque ennemis touché
               //Utilise un son différents aléatoirement
               if (alea<0.125)
               {
                   let melo = new Audio ("assets/notes/316911__jaz-the-man-2__sol-stretched.wav");
                   melo.volume = 0.20;
                   melo.play();
               } else if (alea>0.125 && alea<0.25)
               {
                    let melo = new Audio ("assets/notes/316907__jaz-the-man-2__mi-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
                else if (alea>0.25 && alea<0.375)
               {
                    let melo = new Audio ("assets/notes/316905__jaz-the-man-2__fa-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               else if (alea>0.375 && alea<0.5)
               {
                    let melo = new Audio ("assets/notes/316903__jaz-the-man-2__la-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               else if (alea>0.5 && alea<0.625)
               {
                    let melo = new Audio ("assets/notes/316899__jaz-the-man-2__do-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               else if (alea>0.625 && alea<0.75)
               {
                    let melo = new Audio ("assets/notes/316900__jaz-the-man-2__do-stretched-octave.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               else if (alea>0.75 && alea<0.875)
               {
                    let melo = new Audio ("assets/notes/316909__jaz-the-man-2__re-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               else if (alea>0.875 && alea<1)
               {
                    let melo = new Audio ("assets/notes/316910__jaz-the-man-2__si-stretched.wav");
                    melo.volume = 0.20;
                    melo.play();
               }
               
                //créé des explosions
               for (let i = 0; i< enemy.radius*2; i++)
               {
                    particules.push(new Particule(projectile.x, projectile.y, 
                        Math.random() *2 , 
                        enemy.color, 
                        {x:(Math.random()-0.5) * (Math.random()* 8), //Tailles et portée des exploxions
                         y:(Math.random()-0.5) * (Math.random()* 8)}
                         ))
               }
               if (enemy.radius -10 > 5)// si l'ennemi est trop gros , le reduit juste
               {
                    //augmente ton score
                    score+=100 
                    scoreEl.innerHTML = score

                    gsap.to(enemy,{//reduit la taille de l'ennemi
                       radius : enemy.radius-10
                    })
                    setTimeout(() =>{
                    projectiles.splice(projectileIndex, 1)
                    }, 0)

               }else //disparaissent tout les deux (projectile et ennemi)
               {
                    //augmente ton score
                    score+=250 
                    scoreEl.innerHTML = score
                    setTimeout(() =>{//évite les flash de cercle /antibug
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                      }, 0)
               }
               
           }
        })
    })
}

addEventListener('click', (event)=>{
    // let snd = new Audio("assets/bonk.mp3");
    // snd.play()
    // snd.volume = 0.15;
    const angle = Math.atan2(event.clientY - canvas.height/2,//calcul de la distance par rapport de la ou on clique
                            event.clientX - canvas.width/2)
    const velocity = {
        x: Math.cos(angle) * 4, //calcul de la vitesse pour aller là ou tu cliques
        y: Math.sin(angle) * 4//CHANGE LES VALEURS POUR MODIFIER LA VITESSE DES PROJECTILES
    }
    projectiles.push(new Projectile(
        canvas.width/2 ,
        canvas.height/2 ,
        5,
        'white',
        velocity//objet
    ))
    
})


spawnEnemies()
startBtn.addEventListener('click', ()=> {
    init()
    animate()    
})





