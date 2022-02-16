//Creating semaphore function:
function Semaphore (maxLimit)
{
    //Maximum number of functions using the resource at the sime time:
    let current = 0;
    //Functions waiting to get thier's promises fulfield
    let queue = [];

    this.lower = async function()
    {
        if(current < maxLimit)
        {
            current = current + 1;
            return new Promise(resolve => resolve());
        }
        else
        {
            //Create a Pending Promise to freeze the function
            return new Promise(resolve =>{
                queue.push(resolve);
            });
        }
    }
    this.raise = function()
    {
        if(current>0)
        {
            current = current - 1;
            if(current<maxLimit && queue.length > 0)
            { 
                let toGo = queue.shift();
                toGo();
                current = current + 1;
            }
        }
        
    }
}
//Function for blocking functions for a certain amount of time:
function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Solving the writers and readers problem:

//Number of free spots in library
let freeSpots= 12;
//semaphore for spots
let semaphore = new Semaphore(freeSpots);
//readerSemaphore semaphore for writers:
let readerSemaphore = new Semaphore(1);


async function Reader(readerID, delay)
{
    while (true)
    {
        //Own buissnes:
        await sleep(delay*2000);
        
        //if writer is not waiting:
        
        //Lowering the 'seat' semaphore:
        await readerSemaphore.lower();
            await semaphore.lower();
        readerSemaphore.raise();
        //Setting up the bage on place
        document.getElementById(readerID).innerHTML="R";
        //read:
        await sleep(delay*1000);
        //When finished reading:
        document.getElementById(readerID).innerHTML="";
        //Raising the semaphore
        semaphore.raise();
    }

}
async function Writer(writerID, delay)
{
    while (true)
    {
        //Own buissnes:
        await sleep(delay*1000);

        //Try to reserve the library:
        await readerSemaphore.lower();

        for(let i = 1; i<=freeSpots; i++)
        {
            await semaphore.lower();
        }
        document.getElementById(writerID).innerHTML="W";
        await sleep(4000);
        document.getElementById(writerID).innerHTML="";
        
        //Freeing the libtrary
        readerSemaphore.raise();
        for(let i = 1; i<=freeSpots; i++)
        {
            semaphore.raise();
        }
    }
}

async function start()
{
    
    Writer(1,44);
    Writer(2,28);
    Writer(3,10);
    let id = 1;
    for(let i = 1; i<=freeSpots; i++)
    {
       Reader(i, Math.floor(Math.random() * (5 - 1)) + 1);
    }
}
