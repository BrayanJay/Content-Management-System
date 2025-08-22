import axios from "axios";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProductsPageContents() {
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/productspagecontents`, {
          withCredentials: true,
        })
      } catch(err){
        navigate('/login')
        console.log(err)
      }
    }

    fetchUser()
  }, [navigate])

  // Product pages for content management
  const productPages = [
    {
      id: 'gold-loan',
      title: 'Gold Loan Page',
      description: 'Manage content for gold loan products and services',
      route: '/goldLoanPage',
      icon: '📝',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      id: 'fixed-deposits',
      title: 'Fixed Deposits Page',
      description: 'Edit fixed deposit rates, terms and promotional content',
      route: '/fixedDepositsPage',
      icon: '📊',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'leasing',
      title: 'Leasing Page',
      description: 'Update vehicle and equipment leasing information',
      route: '/leasingPage',
      icon: '🚗',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'mortgage',
      title: 'Mortgage Page',
      description: 'Manage home loan content and calculator settings',
      route: '/mortgagePage',
      icon: '🏠',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'forex',
      title: 'Forex Page',
      description: 'Update exchange rates and forex service details',
      route: '/forexPage',
      icon: '💱',
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'luckewallet',
      title: 'Luckewallet Page',
      description: 'Edit digital wallet features and promotional content',
      route: '/luckewalletPage',
      icon: '📱',
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Product Pages <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Select a product page to edit content, update information, or manage promotional materials
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                CMS Online
              </div>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Product Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {productPages.map((page) => (
            <Link 
              key={page.id}
              to={page.route}
              className="group block"
            >
              <div className={`
                relative bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 ease-out transform hover:-translate-y-1
                border ${page.borderColor} hover:border-transparent
                overflow-hidden h-full
              `}>

                {/* Gradient Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${page.color} 
                  opacity-0 group-hover:opacity-10 transition-opacity duration-300
                `}></div>
                
                {/* Card Content */}
                <div className="relative p-6 md:p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`
                    w-16 h-16 rounded-2xl ${page.bgColor} 
                    flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <span className="text-3xl">{page.icon}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                    {page.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 group-hover:text-gray-700 leading-relaxed flex-grow mb-4">
                    {page.description}
                  </p>
                  
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ProductsPageContents;
