export default function Footer() {
 return (
   <footer className="py-14 border-t border-zinc-900">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
       <div className="text-sm text-zinc-400">
         © {new Date().getFullYear()} Interactive Motion Lab
       </div>

       <div className="flex gap-4 text-sm">
         <a
           className="text-zinc-300 hover:text-white"
           href="https://github.com/Taenggu99"
           target="_blank"
           rel="noreferrer"
         >
           GitHub
         </a>
         <a
           className="text-zinc-300 hover:text-white"
           href="mailto:you@example.com"
         >
           Email
         </a>
       </div>
     </div>
   </footer>
 );
}
