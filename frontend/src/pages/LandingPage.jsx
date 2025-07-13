import React, { useState, useEffect } from 'react';
import { Check, CheckSquare, Calendar, FileText, Target, Users, Star, ArrowRight, Menu, X, Zap, Shield, Smartphone, Layers, Layout, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import flistIcon from '../assets/flist-icon.png';
import { Twitter, Facebook, Github, Instagram } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <CheckSquare className="w-8 h-8" />,
      title: "Task Management",
      description: "Stay on top of your to-dos with clear priorities, due dates, and simple tracking."
    },
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Block-Based Editing",
      description: "Create and organize content with flexible, block-based editing that adapts to any workflow."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Calendar View",
      description: "See all your tasks and plans in a clean calendar, so you never miss a deadline."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Unified Notes",
      description: "Keep your ideas connected with rich text notes linked to your tasks and projects."
    }
  ];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    content: "Flist transformed how I manage my team's work. The connection between tasks and notes is smooth and intuitive.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelance Designer",
    content: "I finally have one place for all my projects, ideas, and deadlines. My productivity has never been higher.",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "Startup Founder",
    content: "The calendar view is a game-changer. I can see everything I need to do in one simple, beautiful interface.",
    rating: 5
  },
  {
    name: "David Kim",
    role: "Software Engineer",
    content: "I love how easy it is to organize my work. The block-based editor makes planning feel effortless.",
    rating: 5
  },
  {
    name: "Laura Williams",
    role: "Marketing Consultant",
    content: "Flist keeps all my notes and tasks perfectly in sync. It’s exactly what I needed to stay organized.",
    rating: 5
  },
  {
    name: "James Patel",
    role: "Entrepreneur",
    content: "Everything is clear and well-designed. Managing my schedule has never felt this smooth.",
    rating: 5
  }
];

  

  const actionOptions = [
    {
      key: 'tasks',
      title: 'Task Board',
      description: 'Visualize and manage all your tasks in a Kanban-style board. Drag and drop to organize your workflow easily.',
      screenshot: '/tasks.png',
      bullets: [
        'Drag & drop task management',
        'Customizable columns for workflow',
        'Quickly mark tasks as done',
        'Prioritize with color labels',
      ],
    },
    {
      key: 'calendar',
      title: 'Calendar View',
      description: 'See your tasks and events on a beautiful calendar. Stay on top of deadlines and plan ahead with ease.',
      screenshot: '/Calendar.png',
      bullets: [
        'Sync tasks with your calendar',
        'Drag tasks to reschedule',
        'View by day, week, or month',
        'Never miss a deadline',
      ],
    },
    {
      key: 'notes',
      title: 'Rich Notes',
      description: 'Capture ideas and meeting notes with rich text editing. Link notes to tasks and projects for full context.',
      screenshot: '/Notes.png',
      bullets: [
        'Rich text and markdown support',
        'Link notes to tasks and projects',
        'Organize with folders and tags',
        'Instant search for all notes',
      ],
    },
    {
      key: 'analytics',
      title: 'Productivity Analytics',
      description: 'Track your progress and productivity with insightful analytics and reports.',
      screenshot: '/dashboard.png', // Dashboard screenshot
      bullets: [
        'Visualize your productivity trends',
        'See completed and upcoming tasks at a glance',
        'Track notes, tasks, and pinned items',
        'Get quick stats and recent activity',
      ],
    },
  ];

  const [selectedAction, setSelectedAction] = useState(actionOptions[0].key);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="w-full z-50 transition-all duration-300 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">
            {/* Logo (left) */}
            <div className="absolute left-0 top-0 h-full flex items-center space-x-2">
              <img src={flistIcon} alt="Flist Icon" className="w-9 h-9 rounded-lg" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Flist
              </h1>
            </div>
            {/* Centered nav links */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-baseline space-x-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
                <a href="#support" className="text-gray-700 hover:text-blue-600 transition-colors">Support</a>
              </div>
            </div>
            {/* Right-aligned Login and Sign Up buttons */}
            <div className="absolute right-0 top-0 h-full hidden md:flex items-center space-x-3">
              <button className="px-5 py-2 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300" onClick={() => navigate('/login')}>Login</button>
              <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden absolute right-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
              <a href="#support" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Support</a>
              <div className="border-t border-gray-200 my-2"></div>
              <button className="w-full text-left px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg mb-1 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300" onClick={() => navigate('/login')}>Login</button>
              <button className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <span className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
                Unified Task & Notes Experience
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Ultimate
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Productivity</span>
              <br />
              Companion
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Flist is the all-in-one tool for staying focused, capturing ideas, and managing your day, seamlessly connected in one beautiful workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => navigate('/login')}
              >
                Start Free Trial
                <ArrowRight className="inline-block w-5 h-5 ml-2" />
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold text-lg bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                onClick={() => navigate('/app')}
              >
                Try as Guest
              </button>
            </div>
          </div>
          
          {/* Hero Cover Screenshot Card */}
          <div className="w-full max-w-5xl mx-auto mt-2 mb-12">
            <div className="relative rounded-3xl border border-blue-100 overflow-hidden bg-white shadow-[0_8px_32px_rgba(37,99,235,0.18)]">
              {/* Blue glow effect */}
              <div className="absolute inset-0 pointer-events-none z-0" style={{
                boxShadow: '0 0 80px 0 rgba(37,99,235,0.18), 0 4px 32px 0 rgba(37,99,235,0.10)'
              }} />
              <img
                src="/Flist-Screenshot.png"
                alt="Flist App Interface Overview"
                className="w-full h-auto object-cover relative z-10"
                style={{ minHeight: '260px', maxHeight: '480px', display: 'block', objectPosition: 'top' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> organized</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your workflow and boost productivity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                    <div className="text-blue-600 group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Flist in action
            </h2>
            <p className="text-xl text-gray-600">
              Experience the seamless integration of tasks, notes, and calendar
            </p>
          </div>
          {/* Action Options Tabs */}
          <div className="flex justify-center gap-4 mb-18 flex-wrap">
            {actionOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setSelectedAction(option.key)}
                className={`px-6 py-2 rounded-full font-semibold border transition-all duration-200 text-lg focus:outline-none
                  ${selectedAction === option.key
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border-transparent'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
              >
                {option.title}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg flex items-center justify-center min-h-[250px] overflow-hidden mr-8">
              <img
                src={actionOptions.find(o => o.key === selectedAction).screenshot}
                alt={actionOptions.find(o => o.key === selectedAction).title + ' screenshot'}
                className="w-[600px] h-[320px] object-cover rounded-2xl shadow-lg border border-blue-100"
                style={{ 
                  objectPosition: actionOptions.find(o => o.key === selectedAction).key === 'calendar' ? 'left' : 'top', 
                  background: 'white' 
                }}
              />
            </div>
            <div className="max-w-xl3">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{actionOptions.find(o => o.key === selectedAction).title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {actionOptions.find(o => o.key === selectedAction).description}
              </p>
              <ul className="space-y-3 mb-6">
                {actionOptions.find(o => o.key === selectedAction).bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 rounded-3xl my-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose your plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you're ready
            </p>
          </div>
          {/* Toggle for monthly/yearly */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden">
              <button
                className={`px-6 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${billing === 'monthly' ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${billing === 'yearly' ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                onClick={() => setBilling('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-transform duration-300 hover:scale-105 flex flex-col justify-between">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-5xl font-extrabold text-blue-600 mb-2">$0</div>
                <p className="text-gray-500">Perfect for personal use</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Up to 100 tasks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Basic notes & calendar</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">2 projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Mobile & desktop sync</span>
                </li>
              </ul>
              <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-full font-semibold bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Get Started Free
              </button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-gray-900 relative overflow-visible shadow-2xl border-2 border-blue-100 z-10 transition-transform duration-300 hover:scale-105 flex flex-col justify-between">
              <div className="absolute -top-5 right-6 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg z-20 border-2 border-white">Best Value</div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">Pro</h3>
                <div className="text-5xl font-extrabold mb-2">
                  {billing === 'monthly' ? '$9.99' : '$7.99'}
                </div>
                <p className="text-gray-600">
                  {billing === 'monthly' ? 'per month' : 'per month (billed yearly)'}
                </p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Unlimited tasks & projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Advanced notes with rich text</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">AI-powered suggestions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-full font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md"
                onClick={() => navigate('/login')}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-xl text-gray-600">
              See what our community is saying about Flist
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Ready to transform your productivity?
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of users who have already revolutionized their workflow with Flist
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => navigate('/login')}
            >
              Start Your Free Trial
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold text-lg bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
              onClick={() => navigate('/app')}
            >
              Try as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="flex flex-col items-start md:items-start mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <img src={flistIcon} alt="Flist Icon" className="w-9 h-9 rounded-lg mr-2" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Flist</span>
              </div>
              <p className="text-gray-400 mb-3 text-sm max-w-xs">
                The ultimate productivity companion for modern professionals.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-3">
                <li><a href="#support" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-3">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            {/* Contact, SNS */}
            <div className="flex flex-col items-start md:items-end w-full mt-8 md:mt-0">
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <a href="mailto:support@flist.com" className="hover:text-white transition-colors text-gray-400 text-sm mb-3">support@flist.com</a>
              <div className="flex space-x-2 mb-3">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">&copy; 2025 Flist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;