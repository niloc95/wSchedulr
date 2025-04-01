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

import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">WebSchedulr Dashboard</h1>
      <p className="mb-4">Welcome to WebSchedulr!</p>
      <div className="mt-4">
        <Link 
          to="/calendar" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Calendar
        </Link>
      </div>
    </div>
  );
}
