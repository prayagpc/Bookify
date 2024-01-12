import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    // ssl: true
});

db.connect();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Fetch all book details on main page
app.get('/', async (req, res) => {
    try {
        const output = await db.query('Select * from books order by bookid');
        //    console.log(output.rows);
        res.render('index.ejs', { result: output.rows });


    } catch (error) {
        console.log(error);

    }
});

// authorized user can add books
app.get(`/add/${process.env.PG_KEY}`, (req, res) => {
    res.render('form.ejs');
})
app.post('/add', (req, res) => {
    const result = req.body;
    const url = `https://covers.openlibrary.org/b/isbn/${result.ISBN}-L.jpg`
    // console.log(url);
    try {
        db.query('insert into books(bookname,authorname,isbn,rating,readdate,summary,source,info) values($1,$2,$3,$4,$5,$6,$7,$8)', [result.BookName, result.AuthorName, result.ISBN, result.Rating, result.date, result.summary, url, result.info]);
        res.redirect('/');

    } catch (error) {
        console.log(error);

    }

});

// Fetch all book details in sorting order based on booktitle
app.get('/title', async (req, res) => {
    try {

        const output = await db.query('Select * from books order by bookname');
        // console.log(output.rows);
        res.render('index.ejs', { result: output.rows });
    } catch (error) {
        console.log(error);
    }
})

// Fetch all book details in sorting order based on recency

app.get('/newest', async (req, res) => {
    try {

        const output = await db.query('Select * from books order by bookid DESC');
        // console.log(output.rows);
        res.render('index.ejs', { result: output.rows });
    } catch (error) {
        console.log(error);

    }
})

// Fetch all book details in sorting order based on rating

app.get('/best', async (req, res) => {
    try {

        const output = await db.query('Select * from books order by rating DESC');
        // console.log(output.rows);
        res.render('index.ejs', { result: output.rows });
    } catch (error) {
        console.log(error);

    }
})

// Fetch particular book details based on bookid
//
app.get('/read/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const output = await db.query('Select * from books where bookid=$1', [id]);
        // console.log(output.rows[0]);
        res.render('read.ejs', { res: output.rows[0] })

    } catch (error) {
        console.log(error);
    }
});


// Authorized user can edit the books
app.get(`/read/:id/edit/${process.env.PG_KEY}`, async (req, res) => {
    try {
        const id = req.params.id;
        const output = await db.query('Select * from books where bookid=$1', [id]);
        // console.log(output.rows[0]);
        res.render('form.ejs', { res: output.rows[0] })

    } catch (error) {
        console.log(error);
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.body;
        const url = `https://covers.openlibrary.org/b/isbn/${result.ISBN}-L.jpg`
        await db.query('update books set bookname=$1,authorname=$2,isbn=$3,rating=$4,readdate=$5,summary=$6,source=$7,info=$8 where bookid=$9', [result.BookName, result.AuthorName, result.ISBN, result.Rating, result.date, result.summary, url, result.info, id]);
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
});

// Authorized user can delete the book
app.get(`/read/:id/delete/${process.env.PG_KEY}`, async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('delete from books where bookid=$1', [id]);
        res.redirect('/');
        res.render()
    } catch (error) {
        console.log(error);
    }
})

// show about section
app.get('/about', (req, res) => {
    res.render('about.ejs');
});
// show contact section
app.get('/contact', (req, res) => {
    res.render('contact.ejs');
});
app.post('/contact', async (req, res) => {
    const result= req.body;
    // console.log(req.body);
    try {
        await db.query('insert into contact (name,surname,email,subject,message) values($1,$2,$3,$4,$5)',[result.name,result.surname,result.email,result.subject,result.message]);
        res.render('contact.ejs', { success: "Thank you for getting in touch. We appreciate your message and will be in touch soon." });
    } catch (error) {
        console.log(error);
    }
});

// fetch books based on search 
app.get('/search',async (req,res)=>{
    const reslt= req.query.search;
    try {
        const output =await db.query(`Select * from books where lower(bookname) like lower('%${reslt}%')`);
        // console.log(output);
        res.render('index.ejs', { result: output.rows });
    } catch (error) {
        console.log(error);
    }
});

// show the contacted user detail
app.get(`/review/${process.env.PG_KEY}` , async(req,res)=>{
    try {
        const output= await db.query('select * from contact');
        // console.log(output.rows);
        res.render("review.ejs",{result: output.rows});
        
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`App is running on  http://localhost:${port}`);
});
