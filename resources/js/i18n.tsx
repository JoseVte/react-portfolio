import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const messages = {
    en: {
        translation: {
            'layouts.seo-title': 'Jose Vicente - Web developer',
            'layouts.title': 'Jose Vicente - Web developer, Hiker, Cat Lover and Board/Card Game Enjoyer.',
            'layouts.description':
                'I’m Jose Vicente, a web developer with extensive experience in design, development, and deployment of web applications.',
            'layouts.description-extended':
                'Expert in languages such as PHP, Javascript and HTML+CSS and frameworks such as Laravel, Vue and Tailwind. Passionate about staying up-to-date with the latest trends and technologies in the field of web development.',

            'layouts.about.title': 'About - Jose Vicente',
            'layouts.about.description': 'I’m Jose Vicente. I live in Elche, where I enjoy life.',

            'layouts.projects.title': 'Projects - Jose Vicente',
            'layouts.projects.description': 'Things I’ve made trying to put my dent in the universe.',

            'layouts.more.title': 'More - Jose Vicente',
            'layouts.more.description': 'Different staffs that I would share with you.',

            'layouts.admin.title': 'Admin - Jose Vicente',
            'layouts.admin.description': 'Admin - Jose Vicente',

            'nav.about': 'About',
            'nav.projects': 'Projects',
            'nav.menu': 'Menu',
            'nav.navigation': 'Navigation',
            'nav.more': 'More',

            'footer.copy': 'All rights reserved.',

            'img-alt.home': 'Home',
            'img-alt.profile': 'Profile',
            'img-alt.photo': 'Photo {{photo}}',

            close: 'Close',
            follow: 'Follow on {{social}}',

            'index.work': 'Work',
            'index.company': 'Company',
            'index.role': 'Role',
            'index.date': 'Date',
            'index.present': 'Present',
            'index.see-repository': 'See repository',
            'index.until': 'to',

            'about.paragraph-1':
                'I am Jose Vicente Orts Romero, a passionate software developer with extensive experience in the field of technology. Over the course of more than 10 years, I have had the opportunity to work on various projects.',
            'about.paragraph-2':
                'My academic background in computer engineering has laid a strong foundation for my professional career. I have specialized in web development, using modern languages and technologies such as Vue, Laravel or React. I thrive on taking on new challenges and seeking creative and efficient solutions to overcome them.',
            'about.paragraph-3':
                'I am always seeking continuous learning and stay updated on the latest trends and advancements in the field of technology. I am passionate about exploring new technologies and finding innovative ways to enhance my skills.',

            'projects.select-year': 'Select a year',
            'projects.stars': '{{count}} stars on GitHub',
            'projects.stars_one': '{{count}} star on GitHub',
            'projects.forks': '{{count}} forks on GitHub',
            'projects.forks_one': '{{count}} fork on GitHub',
            'projects.issues': '{{count}} open issues on GitHub',
            'projects.issues_one': '{{count}} open issue on GitHub',
            'projects.description':
                'I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.',

            'cookie-consent.accept': 'Accept',
            'cookie-consent.decline': 'Decline',
            'cookie-consent.accept-label': 'Accept cookies',
            'cookie-consent.decline-label': 'Decline cookies',
            'cookie-consent.text': 'This website uses cookies to enhance the user experience.',

            'month.1': 'Jan',
            'month.2': 'Feb',
            'month.3': 'Mar',
            'month.4': 'Apr',
            'month.5': 'May',
            'month.6': 'Jun',
            'month.7': 'Jul',
            'month.8': 'Aug',
            'month.9': 'Sep',
            'month.10': 'Oct',
            'month.11': 'Nov',
            'month.12': 'Dec',

            'week.1': 'Mon',
            'week.2': 'Tue',
            'week.3': 'Wed',
            'week.4': 'Thu',
            'week.5': 'Fri',
            'week.6': 'Sat',
            'week.7': 'Sun',

            more: 'More',
            less: 'Less',

            'calendar.tooltip': '{{count}} activities on {{date}}',
            'calendar.total': '{{count}} activities in {{year}}',

            'playroom.title': 'Playroom',
            'playroom.description': 'My small collection of board games that I have acquired over the years.',

            'steam.title': 'Steam',
            'steam.description': 'My small collection of Steam games that I have acquired over the years.',

            'recently-played': 'Recently played',
            'owned-games': 'Owned games',
            'played-2-weeks': 'Last 2 weeks',
            'played-total': 'Total',

            'button.change-appearance': 'Change appearance',
            'appearance.light': 'Light',
            'appearance.dark': 'Dark',
            'appearance.system': 'System',

            'lazy-img.loading': 'Loading {{alt}}...',
            'lazy-img.error': 'Error loading image',

            'status.projects.loading': 'Loading projects from GitHub...',
            'status.projects.error': 'GitHub did not respond, so the projects could not be loaded.',
            'status.projects.see-on-github': 'See them on GitHub',
            'status.projects.empty': 'There are no public projects to show yet.',
            'status.projects.next-page-error': 'The next projects could not be loaded.',
            'status.projects.retry': 'Try again',
            'status.playroom.loading': 'Loading the board game collection...',
            'status.playroom.error': 'The board game collection could not be loaded. Try again later.',
            'status.playroom.empty': 'No board games added yet.',
            'status.steam.loading': 'Loading Steam games...',
            'status.steam.error': 'Steam did not respond, so the games could not be loaded. Try again later.',
            'status.steam.recently-empty': 'No games played in the last two weeks.',
            'status.steam.owned-empty': 'No games to show.',
        },
    },
    es: {
        translation: {
            'layouts.seo-title': 'Jose Vicente - Desarrollador web',
            'layouts.title': 'Jose Vicente - Desarrollador web, Adorador de gatos, Montañero y Juegos de Mesa/Cartas Enjoyer.',
            'layouts.description':
                'Soy Jose Vicente, un desarrollador web con una extensa experiencia en el diseño, desarrollo y despliegue de aplicaciones web.',
            'layouts.description-extended':
                'Experto en lenguajes como PHP, Javascript y HTML+CSS y frameworks como Laravel, Vue y Tailwind. Apasionado por estar al día con las últimas tendencias y tecnologías en el campo del desarrollo web.',

            'layouts.about.title': 'Acerca de - Jose Vicente',
            'layouts.about.description': 'Soy Jose Vicente. Vivo en Elche, donde disfruto la vida.',

            'layouts.projects.title': 'Proyectos - Jose Vicente',
            'layouts.projects.description': 'Cosas que he hecho tratando de hacer mella en el universo.',

            'layouts.more.title': 'Más - Jose Vicente',
            'layouts.more.description': 'Otras cosas que me gustaría compartir con vosotros.',

            'layouts.admin.title': 'Admin - Jose Vicente',
            'layouts.admin.description': 'Admin - Jose Vicente',

            'nav.about': 'Acerca de',
            'nav.projects': 'Proyectos',
            'nav.menu': 'Menú',
            'nav.navigation': 'Índice',
            'nav.more': 'Más',

            'footer.copy': 'Todos los derechos reservados.',

            'img-alt.home': 'Inicio',
            'img-alt.profile': 'Perfil',
            'img-alt.photo': 'Foto {{photo}}',

            close: 'Cerrar',
            follow: 'Sígueme en {{social}}',

            'index.work': 'Trabajos',
            'index.company': 'Empresa',
            'index.role': 'Rol',
            'index.date': 'Fecha',
            'index.present': 'Presente',
            'index.see-repository': 'Ver repositorio',
            'index.until': 'a',

            'about.paragraph-1':
                'Soy Jose Vicente Orts Romero, un apasionado desarrollador de software con amplia experiencia en el campo de la tecnología. A lo largo de más de 10 años, he tenido la oportunidad de trabajar en varios proyectos.',
            'about.paragraph-2':
                'Mi formación académica en ingeniería informática ha sentado una base sólida para mi carrera profesional. Me he especializado en desarrollo web, utilizando lenguajes y tecnologías modernas como Vue, Laravel o React. Me gusta asumir nuevos desafíos y buscar soluciones creativas y eficientes para superarlos.',
            'about.paragraph-3':
                'Siempre busco el aprendizaje continuo y mantenerme actualizado sobre las últimas tendencias y avances en el campo de la tecnología. Me apasiona explorar nuevas tecnologías y encontrar formas innovadoras de mejorar mis habilidades.',

            'projects.select-year': 'Selecciona un año',
            'projects.stars': '{{count}} estrellas en GitHub',
            'projects.stars_one': '{{count}} estrella en GitHub',
            'projects.forks': '{{count}} forks en GitHub',
            'projects.forks_one': '{{count}} fork en GitHub',
            'projects.issues': '{{count}} issues abiertas en GitHub',
            'projects.issues_one': '{{count}} issue abierta en GitHub',
            'projects.description':
                'He trabajado en toneladas de pequeños proyectos a lo largo de los años, pero estos son de los que estoy más orgulloso. Muchos de ellos son de código abierto, por lo que si ve algo que despierta su interés, consulte el código y contribuya si tiene ideas sobre cómo se puede mejorar.',

            'cookie-consent.accept': 'Aceptar',
            'cookie-consent.decline': 'Declinar',
            'cookie-consent.accept-label': 'Aceptar cookies',
            'cookie-consent.decline-label': 'Declinar cookies',
            'cookie-consent.text': 'Este sitio usa cookies para mejorar la experiencia de usuario.',

            'month.1': 'Ene',
            'month.2': 'Feb',
            'month.3': 'Mar',
            'month.4': 'Abr',
            'month.5': 'May',
            'month.6': 'Jun',
            'month.7': 'Jul',
            'month.8': 'Ago',
            'month.9': 'Sep',
            'month.10': 'Oct',
            'month.11': 'Nov',
            'month.12': 'Dic',

            'week.1': 'Lun',
            'week.2': 'Mar',
            'week.3': 'Mié',
            'week.4': 'Jue',
            'week.5': 'Vie',
            'week.6': 'Sáb',
            'week.7': 'Dom',

            more: 'Más',
            less: 'Menos',

            'calendar.tooltip': '{{count}} actividades en {{date}}',
            'calendar.total': '{{count}} actividades en {{year}}',

            'playroom.title': 'Ludoteca',
            'playroom.description': 'Mi pequeña colección de juegos de mesa que he ido adquiriendo con los años.',

            'steam.title': 'Steam',
            'steam.description': 'Mi pequeña colección de juegos de Steam que he ido adquiriendo con los años.',

            'recently-played': 'Juegos recientes',
            'owned-games': 'Mis juegos',
            'played-2-weeks': 'Últimas 2 semanas',
            'played-total': 'Total',

            'button.change-appearance': 'Cambiar apariencia',
            'appearance.light': 'Claro',
            'appearance.dark': 'Oscuro',
            'appearance.system': 'Sistema',

            'lazy-img.loading': 'Cargando {{alt}}...',
            'lazy-img.error': 'Error al cargar la imagen',

            'status.projects.loading': 'Cargando proyectos de GitHub...',
            'status.projects.error': 'GitHub no ha respondido y no se han podido cargar los proyectos.',
            'status.projects.see-on-github': 'Verlos en GitHub',
            'status.projects.empty': 'Todavía no hay proyectos públicos que mostrar.',
            'status.projects.next-page-error': 'No se han podido cargar más proyectos.',
            'status.projects.retry': 'Reintentar',
            'status.playroom.loading': 'Cargando la colección de juegos de mesa...',
            'status.playroom.error': 'No se ha podido cargar la colección de juegos de mesa. Prueba más tarde.',
            'status.playroom.empty': 'Todavía no hay juegos de mesa añadidos.',
            'status.steam.loading': 'Cargando juegos de Steam...',
            'status.steam.error': 'Steam no ha respondido y no se han podido cargar los juegos. Prueba más tarde.',
            'status.steam.recently-empty': 'No he jugado a nada en las últimas dos semanas.',
            'status.steam.owned-empty': 'No hay juegos que mostrar.',
        },
    },
};

export const supportedLanguages = ['en', 'es'];

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: messages,
        supportedLngs: supportedLanguages,
        nonExplicitSupportedLngs: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
