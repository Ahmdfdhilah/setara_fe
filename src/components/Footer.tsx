import { Card } from '@/components/ui/card';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-24">
        {/* Location Column */}
        <Card className="flex flex-col space-y-4 bg-transparent shadow-none border-none">
          <h3 className="text-xl font-semibold text-gray-200">Lokasi Office</h3>
          <div className="relative w-full h-60 rounded-lg overflow-hidden">
            {/* Embed Google Maps */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1984.0347137635664!2d105.2714638188205!3d-5.408262528126818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40fbb7e2b6d8dd%3A0x2b47f10712b8979f!2sJl.%20Purnawirawan%20No.56%20Gedung%20Meneng%2C%20Bandar%20Lampung!5e0!3m2!1sen!2sid!4v1673515491810!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <p className="text-gray-400 mt-2">Jl. Purnawirawan No. 56 Gedung Meneng, Bandar Lampung</p>
        </Card>

        {/* Contact Us Column */}
        <Card className="flex flex-col space-y-4 bg-transparent shadow-none border-none">
          <h3 className="text-xl font-semibold text-gray-200">Kontak Kami</h3>
          <p className="text-gray-400">Phone: 0821-75282776</p>
          <p className="text-gray-400">
            Email: <a href="mailto:setaracommodity@gmail.com" className="hover:text-gray-200">setaracommodity@gmail.com</a>
          </p>
          <p className="text-gray-400">
            Social: <a href="https://twitter.com/setaracommodity" className="hover:text-gray-200">@setaracommodity</a>
          </p>
        </Card>
      </div>

      {/* Footer Copyright */}
      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm">© 2024 Setara Commodity. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;