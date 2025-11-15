import { type JSX, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import UserRegisterPage from "../pages/Auth/UserRegisterPage.tsx";
import DashboardLayout from "../features/dashboard/DashboardLayout.tsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";
import ContiPage from "../pages/Conti/ContiPage.tsx";
import ProfilePage from "../pages/Profile/ProfilePage.tsx";
import OperazioniPage from "../pages/Transazioni/OperazioniPage.tsx";
import FinanziamentoPage from "../pages/Finanziamento/FinanziamentoPage.tsx";
import FinanziamentoSimulationPage from "../pages/Finanziamento/FinanziamentoSimulationPage.tsx";
import InvestimentiPage from "../pages/Investimenti/InvestimentiPage.tsx";
import SessionManager from "../features/SessioneManager.tsx";
import { useAppSelector } from '../app/hooks';
import FinanziamentoDetailPage from "../pages/Finanziamento/FinanziamentoDetailPage.tsx";
import CartePage from "../pages/Carte/CartePage.tsx";
import CartaDetailsPage from "../pages/Carte/CartaDetailsPage.tsx";
import InvestimentoDettaglioPage from "../pages/Investimenti/InvestimentoDettaglioPage.tsx";
import InvestimentoRendimentiPage from "../pages/Investimenti/InvestimentoRendimentoPage.tsx";

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const token = useAppSelector(state => state.auth.accessToken);
    if (!token) return <Navigate to="/auth/login" replace />;
    return children;
}

export default function AppRouter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SessionManager />
            <Routes>
                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<UserRegisterPage />} />
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Dashboard routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardPage />} /> {/* /dashboard */}

                    {/* Conti */}
                    <Route path="conti" element={<ContiPage />} /> {/* /dashboard/conti */}

                    {/* Profile */}
                    <Route path="profile" element={<ProfilePage />} /> {/* /dashboard/profile */}

                    {/* Operazioni */}
                    <Route path="operazioni" element={<OperazioniPage />} />

                    {/* Mutui */}
                    <Route path="finanziamenti" element={<FinanziamentoPage />} />
                    <Route path="dettaglioRate" element={<FinanziamentoDetailPage />} />
                    <Route path="simulazioneMutui" element={<FinanziamentoSimulationPage />} />

                    {/* Investimenti */}
                    <Route path="investimenti" element={<InvestimentiPage />} />
                    <Route path="dettaglio" element={<InvestimentoDettaglioPage />} />
                    <Route path="/dashboard/investimenti/:identificativo" element={<InvestimentoRendimentiPage />} />

                    {/*Carte*/}
                    <Route path="carte" element={<CartePage />} />
                    <Route path="dettaglioCarta/:id" element={<CartaDetailsPage />} />

                </Route>
            </Routes>
        </Suspense>
    );
}
