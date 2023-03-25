import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./db.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

const app = express();

// MIDDLEWARE

// untuk membaca body berformat JSON
app.use(express.json());

// untuk mengelola cookie
app.use(cookieParser());

// untuk mengakses file statis
app.use(express.static("public"));

// untuk memeriksa otorisasi
app.use((req, res, next) => {
  if (req.path.startsWith("/api/login") || req.path.startsWith("/assets")) {
    next();
  } else {
    let authorized = false;
    if (req.cookies.token) {
      try {
        jwt.verify(req.cookies.token, process.env.SECRET_KEY);
        authorized = true;
      } catch (err) {
        res.clearCookie("token");
      }
    }
    if (authorized) {
      if (req.path.startsWith("/login")) {
        res.redirect("/");
      } else {
        next();
      }
    } else {
      if (req.path.startsWith("/login")) {
        next();
      } else {
        if (req.path.startsWith("/api")) {
          res.status(401);
          res.send("Anda harus login terlebih dahulu.");
        } else {
          res.redirect("/login");
        }
      }
    }
  }
});

// ROUTE OTORISASI

// login (dapatkan token)
app.post("/api/login", async (req, res) => {
  const results = await client.query(
    `SELECT * FROM mahasiswa WHERE nim = '${req.body.nim}'`
  );
  if (results.rows.length > 0) {
    if (await bcrypt.compare(req.body.password, results.rows[0].password)) {
      const token = jwt.sign(results.rows[0], process.env.SECRET_KEY);
      res.cookie("token", token);
      res.send("Login berhasil.");
    } else {
      res.status(401);
      res.send("Kata sandi salah.");
    }
  } else {
    res.status(401);
    res.send("Mahasiswa tidak ditemukan.");
  }
});

// dapatkan mahasiswa saat ini (yang sedang login)
app.get("/api/me", (req, res) => {
  const me = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
  res.json(me);
});

// logout (hapus token)
app.get("/api/logout", (_req, res) => {
  res.clearCookie("token");
  res.send("Logout berhasil.");
});

// ROUTE MAHASISWA

// dapatkan semua
app.get("/api/mahasiswa", async (_req, res) => {
  const results = await client.query("SELECT * FROM mahasiswa ORDER BY id");
  res.json(results.rows);
});

// dapatkan satu
app.get("/api/mahasiswa/:id", async (req, res) => {
  const results = await client.query(
    `SELECT * FROM mahasiswa WHERE id = ${req.params.id}`
  );
  res.json(results.rows[0]);
});

// tambah
app.post("/api/mahasiswa", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(req.body.password, salt);
  await client.query(
    `INSERT INTO mahasiswa (nim, nama, password) VALUES ('${req.body.nim}', '${req.body.nama}', '${hash}')`
  );
  res.send("Mahasiswa berhasil ditambahkan.");
});

// edit
app.put("/api/mahasiswa/:id", async (req, res) => {
  await client.query(
    `UPDATE mahasiswa SET nim = '${req.body.nim}', nama = '${req.body.nama}' WHERE id = ${req.params.id}`
  );
  res.send("Mahasiswa berhasil diedit.");
});

// hapus
app.delete("/api/mahasiswa/:id", async (req, res) => {
  await client.query(`DELETE FROM mahasiswa WHERE id = ${req.params.id}`);
  res.send("Mahasiswa berhasil dihapus.");
});

// ROUTE PELATIHAN

// dapatkan semua
app.get("/api/pelatihan", async (_req, res) => {
  const results = await client.query("SELECT * FROM pelatihan");
  res.json(results.rows);
});

// MEMULAI SERVER

app.listen(3000, () => {
  console.log("Server berhasil berjalan.");
});
