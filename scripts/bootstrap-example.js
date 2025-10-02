#!/usr/bin/env node

/**
 * Example usage of the bootstrap configuration system
 * This demonstrates how to load PRD and Tech Stack as source of truth
 */

import { bootstrap, getConfig } from '../packages/shared/dist/config/index.js';

async function main() {
  try {
    // Bootstrap the configuration - this loads docs/prd.json and docs/techstack.json
    console.log('🚀 Bootstrapping AI Interview Coach configuration...\n');
    
    const config = bootstrap();
    
    // Now you can access the configurations
    const { prd, techstack } = config;
    
    console.log('\n📋 PRD Information:');
    console.log(`   Project: ${prd.project}`);
    console.log(`   Owner: ${prd.owner}`);
    console.log(`   Features: ${prd.features.length} features defined`);
    console.log(`   Roadmap: ${prd.roadmap.length} phases planned`);
    
    console.log('\n🏗️  Tech Stack Information:');
    console.log(`   Monorepo: ${techstack.monorepo.enabled ? 'Enabled' : 'Disabled'} (${techstack.monorepo.package_manager})`);
    console.log(`   Node: ${techstack.node.version_range}`);
    console.log(`   Frontend: ${techstack.frontend.framework} (${techstack.frontend.language})`);
    console.log(`   Backend: ${techstack.backend.pattern}`);
    console.log(`   Extension: MV${techstack.extension.manifest_version}`);
    
    console.log('\n📁 Directory Structure:');
    console.log(`   Web: ${techstack.directories.web}`);
    console.log(`   Backend: ${techstack.directories.backend}`);
    console.log(`   Extension: ${techstack.directories.extension}`);
    console.log(`   Shared: ${techstack.directories.shared}`);
    
    console.log('\n🎯 Features (from PRD):');
    prd.features.forEach(feature => {
      console.log(`   ${feature.id}: ${feature.name}`);
      console.log(`      ${feature.description}`);
      console.log(`      Dependencies: ${feature.dependencies?.length || 0}`);
      console.log(`      Acceptance Criteria: ${feature.acceptance_criteria.length}`);
      console.log('');
    });
    
    console.log('\n🗺️  Roadmap (from PRD):');
    prd.roadmap.forEach(phase => {
      console.log(`   Phase ${phase.phase}: ${phase.title}`);
      console.log(`      Deliverables: ${phase.deliverables.length}`);
      console.log('');
    });
    
    console.log('\n⚙️  Development Phases (from Tech Stack):');
    techstack.phases.forEach(phase => {
      console.log(`   Phase ${phase.phase}: ${phase.scope.join(', ')}`);
      console.log(`      Notes: ${phase.notes}`);
      console.log('');
    });
    
    console.log('\n✅ Bootstrap example completed successfully!');
    
  } catch (error) {
    console.error('❌ Bootstrap example failed:', error.message);
    process.exit(1);
  }
}

// Run the example
main();

