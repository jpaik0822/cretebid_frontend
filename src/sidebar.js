import React from "react";
import "./sidebar.css";

const navItems = [
    { id: "upload", label: "Upload File", icon: "✦" },
    { id: "queries", label: "Chatbot", icon: "◈" },
];

export default function Sidebar({ isOpen, onToggle, activePage, onNavigate }) {
    return (
        <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
            <div className="sidebar-header">
                {isOpen && <span className="sidebar-logo">CreteBid</span>}
                <button className="toggle-btn" onClick={onToggle}>☰</button>
            </div>
            <nav>
                {navItems.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        className={`nav-item ${activePage === id ? "active" : ""}`}
                        onClick={() => onNavigate(id)}
                    >
                        <span className="nav-icon">{icon}</span>
                        {isOpen && <span className="nav-label">{label}</span>}
                    </button>
                ))}
            </nav>
        </aside>
    );
}