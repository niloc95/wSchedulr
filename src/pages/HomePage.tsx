/* ----------------------------------------------------------------------------
 * @webSchedulr - Online Appointment Scheduler
 *
 * @package     @webSchedulr - Your all-in-one scheduling solution for managing appointments with ease
 * @author      N N.Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara 2025
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webschedulr.co.za
 * @since       v1.0.0
 * ---------------------------------------------------------------------------- */



import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';


export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <div className="mb-8 inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
          <FontAwesomeIcon 
            icon={faCalendarAlt} 
            className="text-3xl text-blue-600 dark:text-blue-400" 
          />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
          Welcome to <span className="text-blue-600 dark:text-blue-400">WebSchedulr</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Your all-in-one scheduling solution for managing appointments with ease
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
            Get Started
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
          
          <button className="px-8 py-3 text-lg font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            Learn More
          </button>
        </div>
        
        <div className="mt-16 text-sm text-gray-500 dark:text-gray-400">
          Trusted by professionals worldwide
        </div>
      </div>
    </div>
  );
}
