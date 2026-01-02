require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT 
const {createClient} = require("@supabase/supabase-js")
const SUPABASEURL = process.env.SUPABASEURL
const SUPABASEKEY = process.env.SUPABASEKEY
const supabase = createClient(SUPABASEURL,SUPABASEKEY)
const cors = require("cors")
const http = require("http")
const path = require("path")
const { error } = require("console")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { CLIENT_RENEG_WINDOW } = require("tls")
const SECRETKEY = process.env.SECRETKEY




// Middlewares
app.use(cookieParser())
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:"https://luvtonotef.vercel.app",
    methods:["GET","POST"],
    credentials:true
}))

// Routes
app.get("/",(req,res)=>{
    res.render("home")
})

app.post("/signin",async(req,res)=>{
    let {email,name,picture} = req.body
    try{
        let {data:user} = await supabase
        .from("users2")
        .select("email")
        .eq("email",email)
        .single()
        if(!user){
            let today = new Date()
            let date = String(today.getDate()).padStart(2,"0")
            let month = String(today.getMonth()+1).padStart(2,"0")
            let year = today.getFullYear()
            today = date + "/" + month + "/" + year
            let token = jwt.sign({email},SECRETKEY)
            res.cookie("token",token)
            let {data:insert,err} = await supabase
            .from("users2")
            .insert([{
                email:email,
                name:name,
                date:today,
                picture:picture
            }])
            if(err){
                return res.status(401).json({
                    message:"Error inserting user",
                    redirect:false,
                    error:err
                })
            }
            else{
                return res.status(201).redirect("/profile")
            }
        }
        else{
            let token = jwt.sign({email},SECRETKEY)
            res.cookie("token",token)
            return res.status(200).redirect("/profile")
        }
    }
    catch(err){
        return res.status(500).redirect("https://luvtonotef.vercel.app/signin")
    }
})

// Customised Middleware
const issignedin = (req,res,next) => {
    let token = req.cookies.token
    try{
        if(!token){
            return res.redirect("https://luvtonotef.vercel.app/signin")
        }
        else{
            let data = jwt.verify(token,SECRETKEY)
            req.user = data
            next()
        }
    }
    catch(err){
        return res.redirect("https://luvtonotef.vercel.app/signin")
    }
} 

app.get("/profile",issignedin,async(req,res)=>{
    let {data:user} = await supabase
    .from("users2")
    .select("*")
    .eq("email",req.user.email)
    .single()
    let {data:total} = await supabase
    .from("notes")
    .select("*")
    .eq("email",req.user.email)
    let totalnotes = total.length
    let picture = user.picture
    let email = user.email
    let username = user.name
    let date = user.date
    res.render("profile",{username,picture,email,date,totalnotes})
})

// Logout Route 
app.get("/signout",(req,res)=>{
    res.cookie("token","")
    return res.redirect("https://luvtonotef.vercel.app/signin")
})
app.get("/create",issignedin,(req,res)=>{
    res.render("create")
})
app.post("/create",issignedin,async(req,res)=>{
    let {title,note} =  req.body
    try{
    let {data:user} = await supabase
    .from("users2")
    .select("*")
    .eq("email",req.user.email)
    .single()
    let email = user.email
    let today = new Date()
    let date = String(today.getDate()).padStart(2,"0")
    let month = String(today.getMonth()+1).padStart(2,"0")
    let year = today.getFullYear()
    today = date + "/" + month + "/" + year
    let {data:insert,err} = await supabase
    .from("notes")
    .insert([{
        title:title,
        note:note,
        date:today,
        email:email
    }])
    if(err){
        return res.redirect("/create")
    }
    else{
        return res.redirect("/allnotes")
    }
    }
    catch(err){
        return res.redirect("/create")
    }
})

app.get("/allnotes",issignedin,async(req,res)=>{
    let {data:notes} = await supabase
    .from("notes")
    .select("*")
    .eq("email",req.user.email)
    let total = notes.length
    res.render("allnotes",{notes,total})
})
// Delete a single note by its id for the signed-in user
// Delete note(s) by title for the signed-in user
app.get("/delete/:title",issignedin,async(req,res)=>{
    try{
        const title = req.params.title
        const email = req.user.email

        const { data, error } = await supabase
        .from("notes")
        .delete()
        .eq("title", title)
        .eq("email", email)

        if(error){
            console.error('Supabase delete error:', error)
            return res.status(500).redirect("/allnotes")
        }

        return res.redirect("/allnotes")
    }
    catch(err){
        console.error('Delete route error:', err)
        return res.redirect("/allnotes")
    }
})

app.get("/edit/:title",issignedin,async(req,res)=>{
    let title = String(req.params.title)
    let {data:task} = await supabase
    .from("notes")
    .select("*")
    .eq("title",title)
    .single()
    let note = task.note
    let date = task.date
    let length = note.length
    res.render("edit",{title,note,date,length})
})

app.post("/edit",issignedin,async(req,res)=>{
    let {prevtitle} = req.body
    let {newtitle} = req.body
    let {newnote} = req.body
    let {data:task} = await supabase
    .from("notes")
    .update({title:newtitle,note:newnote})
    .eq("title",prevtitle)
    return res.redirect("/allnotes")
})

// Listening / Hosting 
app.listen(PORT,()=>{
    console.log(`App is listening at port ${PORT}`)
})