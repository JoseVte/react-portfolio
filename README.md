# Portfolio Project

A modern, high-performance personal portfolio application built with the latest web technologies. This project showcases
a seamless integration between a robust Laravel backend and a reactive React frontend using Inertia.js.

## 🚀 Tech Stack

- **Backend:** [Laravel 12](https://laravel.com)
- **Frontend:** [React 19](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Bridge:** [Inertia.js](https://inertiajs.com/) (The modern monolith approach)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with `tailwindcss-animate`
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Internationalization:** [i18next](https://www.i18next.com/)
- **State/Data Management:** Laravel Sanctum & MySQL
- **Testing:** Pest / PHPUnit

## ✨ Features

- **Server-Side Rendering (SSR):** Optimized for SEO and fast initial page loads.
- **Multi-language Support:** Full i18n implementation for global reach.
- **Modern UI/UX:** Built with Headless UI, Flowbite React, and Framer Motion-like animations (React Awesome Reveal).
- **Responsive Design:** Mobile-first approach using Tailwind CSS.
- **Admin Dashboard:** Secure area to manage projects and content.
- **Error Tracking:** Integrated with Sentry for real-time monitoring.

## 📁 Project Structure

```text
resources/js/
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── layouts/      # Page wrappers (Admin, Guest, etc.)
├── pages/        # Main application views (About, Admin, Homepage, Projects)
├── types/        # TypeScript definitions
└── app.tsx       # Frontend entry point
```

## 🛠️ Installation & Setup

1. **Clone the repository:**

``` bash
   git clone <your-repo-url>
   cd portfolio
```

2. Install PHP dependencies:

``` bash
    composer install
```

3. Install JavaScript dependencies:

``` bash
npm install
```

4. Environment Configuration:

``` bash
    cp .env.example .env
    php artisan key:generate
```

5. Don't forget to configure your database settings in .env.
6. Database Migration:

``` bash
php artisan migrate
```

7. **Compile Assets:**

``` bash
    # For development
    npm run dev

    # For production
    npm run build
```

8. Run the application:

``` bash
php artisan serve
```

## 🧪 Testing

Run the test suite to ensure everything is working correctly:

``` bash
php artisan test
```

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
