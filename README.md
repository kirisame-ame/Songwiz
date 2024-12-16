# TUGAS BESAR ALGEO 2
Proyek ini bertujuan untuk melakukan perbandingan kemiripan musik berdasarkan file MIDI. Tugas utama dari proyek ini adalah mengekstraksi fitur dari file MIDI, memprosesnya, dan membandingkan kemiripan file tersebut menggunakan pendekatan cosine similarity. Perbandingan dilakukan berdasarkan fitur-fitur berikut:

- ATB (Absolute Tone-Based) Histogram
- RTB (Relative Tone-Based) Histogram
- FTB (First Tone-Based) Histogram

Selain itu Proyek ini juga dapat mencari suatu album musik berdasarkan image masukan.

## Fitur
- Mengekstraksi Fitur dari File MIDI: Program ini membaca file MIDI, memproses data, dan mengekstrak fitur-fitur seperti Absolute Tone-Based (ATB), Relative Tone-Based (RTB), dan First Tone-Based (FTB) histogram.
- Cosine Similarity: Program ini menghitung cosine similarity antara fitur dari file MIDI query dan file MIDI dalam database.
- Pemrosesan Secara Konkuren: Proyek ini mendukung pemrosesan secara konkuren untuk mempercepat komputasi menggunakan concurrent.futures.ProcessPoolExecutor milik Python.
- Dynamic Time Wrapping : digunakan untuk mencari jarak terdekat pada file WAV/MP3
- PCA : digunakan untuk menyederhanakan hasil ekstrak fitur dari image.

## Instalasi
Untuk memulai dengan proyek ini, Anda perlu memastikan bahwa Python 3.7+ terinstal. Kemudian, Anda dapat menginstal dependensi yang dibutuhkan dengan menggunakan pip.
pip install -r requirements.txt
