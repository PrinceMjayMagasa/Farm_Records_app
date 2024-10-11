const express = require ('express');
const dotenv = require ('dotenv');
const bodyParser = require ('body-parser');
const path = require ('path')
 const mysql = require ('mysql2')
 const bcrypt = require('bcrypt')
 const cors =  require ('cors')

 const app = express();
 app.use(express.json());
 app.use(bodyParser.json())
 app.use(express.static(path.join(__dirname)))
app.use(express.urlencoded({extended:true}))
dotenv.config()
app.use (cors())

const conn = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:'farm_records'

})
conn.connect((err)=>{
    if (err){
        console.log("ERROR CONNECTING DATABASE")
        return;
    }
    console.log('DATABASE CONNECTION SUCCESSFULL')
    
})
app.get('/api/farmer/registration',(req,res)=>{
    res.sendFile(path.join(__dirname,'register.html'));
})
//route for registration
app.post('/api/farmer/registration',(req,res)=>{
    const{user_name,email,password}= req.body;
    if(!user_name||!email||!password){
      return res.json({message:"Please enter required details"})  
    }
    const hashedPassword = bcrypt.hashSync(password,10)
    const Checkuser =`SELECT * FROM users WHERE email = ?`;
    conn.query(Checkuser,[email],(err,result)=>{
        if(err){
            console.log("MYSQL query error")
            return res.json({message:"Internal error "})
        }
        if (result.length>0){
            return res.json({message:"User Already exists"})
        }
        const newfarmer = ` INSERT INTO users(user_name,email,password)VALUES(?,?,?) `
        conn.query(newfarmer,[user_name,email,hashedPassword],(err,result)=>
        {
            if(err){
                    console.log("error inserting values");
                  return res.json({message:"ERROR CREATING ACCOUNT"})
                
                }
             return res.json({message:"Farmer account created successfully"})
        })
    })

     
}
)

app.get("/api/farmer/login",(req,res)=>{
    res.sendFile(path.join(__dirname,'login.html'))
})
//route for login
app.post("/api/farmer/login",(req,res)=>{
    const{email,password}= req.body
    if(!email||!password){
        return res.json({message:"Please enter the required credentials"})
    
    }
    const farmerInfo=`SELECT * FROM users WHERE email =?`
    conn.query(farmerInfo,[email],(err,result)=>{
        if(err){
            return res.json ({message:"Farmer not found"})
        }
        if(result.length===0){
                return res.json({message:'Invalid credentials'})
        }
        return res.json({message:"Login Successfull"})
    })
  
})

app.get("/api/add/financial_record",(req,res)=>{
    res.sendFile(path.join(__dirname,'addfinancialrec.html'))
})
//route for adding financial record
app.post("/api/add/financial_record",(res,req)=>{
    const{transaction_name,description,amount,date}= req.body;

    if(!transaction_name||!description||!amount||!date){
        return res.json({message:"Please enter all records"})
    
    }
    const addRecord = `INSERT INTO financial_records(transaction_name,description,amount,date) VALUES(?,?,?)`
    conn.query(addRecord,[transaction_name, description,amount,date],(err,result)=>{
        if (err){
            return res.json({message:"Failure in adding record"})
        }
        return res.json({message:'Added financial record successfully'})
    })
})

app.get('/api/add/activity_record',(req,res)=>{
    res.sendFile(path.join(__dirname,'addactivityrec.html'))
})
//route for adding activity record
app.post('/api/add/activity_record',(res,req)=>{
    const{activity_name,description,date} = req.body
    if(!activity_name|!description|!date){
        return res.json({message:"Please enter all records"})

    }
    const addactRecord =`INSERT INTO activity_records (activity_name,description,date)VALUES(?,?,?)`
    conn.query(addactRecord,[activity_name,description,date],(err,result)=>{
        if(err){
            return
             res.json({message:"Error adding activity record"})
        }
        return res.json({message:"Activity record added suceccsully"})
    })
})
//route to display all financial records
app.get('/api/view/finacial_records',(req,res)=>{
    const viewFinancial = `SELECT * FROM financial_records`;
    conn.query(viewFinancial,(err,results)=>{
        if (err){
             return res.json({message:"Database query error"})
        }
        return res.json (results)
    })
})
//route to display all activity records
app.get('/api/view/activity_records',(req,res)=>{
    const viewActivity = `SELECT * FROM activity_records`;
    conn.query(viewActivity,(err,results)=>{
        if (err){
             return res.json({message:"Database query error"})
        }
        return res.json (results)
    })
})



app.listen(6000,(err)=>{
    if(err){
        console.log("server is not running")
        return;
    }
console.log("server is runing on port 6000")
})
