# 🔖 Smart Bookmarks

A modern, real-time bookmark manager built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Experience seamless bookmarking with instant synchronization across devices and a premium glassmorphism UI.

<img width="1919" height="907" alt="image" src="https://github.com/user-attachments/assets/cd85384a-bbc5-4b1c-8342-2b4e6efa7ebc" />


## ✨ Features

- **🚀 Real-time Synchronization**: Bookmarks update instantly across all open tabs and devices using Supabase Realtime.
- **🔐 Secure Authentication**: Robust Google OAuth integration via Supabase Auth.
- **🎨 Premium UI/UX**:
  - sleek **Glassmorphism** design system.
  - Fully responsive grid layout.
  - Smooth micro-interactions and animations.
- **⚡ Super Fast**: Built on Next.js Server Actions and Optimistic UI updates.
- **🌐 Smart Favicons**: Automatically fetches high-resolution icons for every bookmarked URL.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js 18+ installed.
- A Supabase project created.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AG6589/smart-bookmarks.git
    cd smart-bookmarks
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the following SQL in your Supabase SQL Editor to create the table and enable Realtime:

    ```sql
    -- Create bookmarks table
    create table bookmarks (
      id uuid default gen_random_uuid() primary key,
      created_at timestamp within time zone default now(),
      title text,
      url text,
      user_id uuid references auth.users not null
    );

    -- Enable Row Level Security (RLS)
    alter table bookmarks enable row level security;

    -- Create Policy: Users can only see their own bookmarks
    create policy "Users can view their own bookmarks"
      on bookmarks for select
      using ( auth.uid() = user_id );

    create policy "Users can insert their own bookmarks"
      on bookmarks for insert
      with check ( auth.uid() = user_id );

    create policy "Users can delete their own bookmarks"
      on bookmarks for delete
      using ( auth.uid() = user_id );

    -- Enable Realtime
    alter publication supabase_realtime add table bookmarks;
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
