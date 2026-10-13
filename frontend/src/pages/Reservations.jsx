import React from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import { Bookmark, Clock, CheckCircle2, Store, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reservations({ reservations = [] }) {
  return (
    <PageContainer maxWidth="normal">
      <SectionHeading
        badge="Customer Portal"
        badgeColor="forest"
        title="My Food Reservations"
        subtitle="Active surplus meal pickup tickets and order history."
      />

      {reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((res) => (
            <Card key={res.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Left Details */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 rounded-2xl bg-[#FAF4EB] overflow-hidden shrink-0 border border-[#E6D9C5]">
                  <img
                    src={res.image || '/images/bakery.jpg'}
                    alt={res.foodName || res.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/bakery.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-[#285C46] uppercase tracking-wider bg-[#DDE8D8] px-2.5 py-0.5 rounded-full">
                      {res.id}
                    </span>
                    <span className="text-xs font-semibold text-[#78977D]">
                      {res.reservationTime || 'Just now'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1C2A23] leading-snug">
                    {res.foodName || res.name}
                  </h3>

                  <p className="text-xs text-[#5C6A62] font-medium mt-0.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#78977D]" />
                    {res.restaurant}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#2E3933] mt-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#285C46]" />
                    <span>Pickup: <strong className="text-[#1C2A23]">{res.pickupWindow}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Status & Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#F3EADB]">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#5C6A62] block font-medium">
                    {res.quantity || 1} Portion(s)
                  </span>
                  <span className="text-xl font-black text-[#285C46]">₹{res.price || res.rescuePrice}</span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDE8D8] text-[#1E4736] text-xs font-bold border border-[#B8D1C3]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#285C46]" />
                  <span>{res.status || 'CONFIRMED'}</span>
                </div>
              </div>

            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-[#E6D9C5] p-12 text-center my-8">
          <div className="w-12 h-12 rounded-full bg-[#DDE8D8] text-[#285C46] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1C2A23]">No Active Reservations Yet</h3>
          <p className="text-[#5C6A62] text-sm max-w-sm mx-auto mt-1 mb-6">
            Reserve surplus food offers from local restaurants to save money and prevent food waste.
          </p>
          <Link to="/explore">
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Explore Surplus Meals
            </Button>
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
